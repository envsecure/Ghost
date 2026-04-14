/**
 * Database VIEW definitions.
 *
 * Each key is the VIEW name. The value is the raw SQL body (everything after
 * "CREATE VIEW <name> AS"). VIEWs are created during `knex-migrator init`
 * (after all tables) and via versioned migrations for upgrades.
 */
// Resolution rule for the "current" subscription per member:
//   1. Active statuses beat inactive ones — Ghost's convention is the same
//      set used across member-repository, router-controller, etc:
//      `active`, `trialing`, `past_due`, `unpaid` count as active.
//   2. Most recent `start_date` wins. Tiers (products) in Ghost are discrete
//      rather than hierarchical, so we don't compare price/MRR — whichever
//      subscription the member most recently signed up for or was moved to
//      is the one that represents their current state, regardless of whether
//      that's an "upgrade" or "downgrade".
//   3. `id ASC` is a stable final tiebreaker for the rare case where two
//      subscriptions share the same `start_date` (programmatic creation,
//      simultaneous webhooks).
//
// `mostRelevantSubscription` in apps/posts/src/views/members/member-query-params.ts
// must match this ordering so the displayed sub matches the filter result.
module.exports = {
    members_resolved_subscription: `
        SELECT member_id, subscription_id
        FROM (
            SELECT
                msc.member_id,
                mscs.id as subscription_id,
                ROW_NUMBER() OVER (
                    PARTITION BY msc.member_id
                    ORDER BY
                        CASE WHEN mscs.status IN ('active', 'trialing', 'past_due', 'unpaid') THEN 0 ELSE 1 END,
                        mscs.start_date DESC,
                        mscs.id ASC
                ) as rn
            FROM members_stripe_customers_subscriptions mscs
            JOIN members_stripe_customers msc ON msc.customer_id = mscs.customer_id
        ) ranked
        WHERE rn = 1
    `
};
