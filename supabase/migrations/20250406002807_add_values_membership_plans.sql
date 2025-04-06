-- Insert default membership plans
insert into membership_plans (
    id,
    tier,
    name,
    description,
    price_monthly,
    price_annual,
    features,
    max_bookings_per_month,
    court_reservation_window,
    partner_matching_priority,
    cancellation_window,
    guest_passes,
    discounts
  )
values (
    'drop-in',
    'drop-in',
    'Drop-In Pass',
    'Perfect for occasional players',
    10,
    0,
    jsonb_build_array(
      jsonb_build_object(
        'name',
        'Single game access',
        'description',
        null,
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'No commitment required',
        'description',
        null,
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'Full access to game features',
        'description',
        null,
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'Cancel anytime',
        'description',
        null,
        'included',
        true
      )
    ),
    null,
    -- no monthly limit
    null,
    -- no reservation window defined
    null,
    -- no partner priority defined
    null,
    -- no cancellation rule defined
    null,
    -- no guest passes
    null -- no discounts
  ),
  (
    'monthly',
    'monthly',
    'Monthly Membership',
    'Best value for regular players',
    50,
    0,
    jsonb_build_array(
      jsonb_build_object(
        'name',
        'Unlimited game access',
        'description',
        null,
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'Priority booking',
        'description',
        null,
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'Member-only events',
        'description',
        null,
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'Exclusive discounts',
        'description',
        null,
        'included',
        true
      ),
      jsonb_build_object(
        'name',
        'Cancel anytime',
        'description',
        null,
        'included',
        true
      )
    ),
    null,
    null,
    null,
    null,
    null,
    null
  );