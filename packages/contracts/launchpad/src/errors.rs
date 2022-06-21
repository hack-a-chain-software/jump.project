/// Contract errors
pub const ERR_001: &str = "ERR_001: Only owner can call this method";
pub const ERR_002: &str = "ERR_002: Only owner or guardian can call this method";
pub const ERR_003: &str = "ERR_003: listing_id does not exist";
pub const ERR_004: &str = "ERR_004: investor is not registered";
pub const ERR_005: &str = "ERR_005: Guardian already registered";
pub const ERR_006: &str = "ERR_006: Account not registered as guardian";

/// Listing errors
pub const ERR_101: &str = "ERR_101: Can only cancel funded listings before their start date";
pub const ERR_102: &str = "ERR_102: Only the project owner can call this method";
pub const ERR_103: &str = "ERR_103: Can only withdraw funds after sale is finalized or cancelled";
pub const ERR_104: &str = "ERR_104: Transferred token doesn't match listing token type";
pub const ERR_105: &str = "ERR_105: Transferred quantity doesn't match listing requirement";
pub const ERR_106: &str = "ERR_106: Listing is not in sale phase";

/// Investor errors
pub const ERR_201: &str = "ERR_201: Storage deposit insufficient for this transaction";
pub const ERR_202: &str = "ERR_202: Storage deposited was less tha minimum deposit";
pub const ERR_203: &str = "ERR_203: Cannot delete investor account, pending investment allocations to withdraw";
pub const ERR_204: &str = "ERR_204: Membership can only be validated through the membership_token";
pub const ERR_205: &str = "ERR_205: Requested membership level does not exist";
pub const ERR_206: &str = "ERR_206: Not enough tokens deposited for this membership level";
pub const ERR_207: &str = "ERR_207: Cannot downgrade membership level with increase_membership_tier call";
pub const ERR_208: &str = "ERR_208: Not enough membership tokens to withdraw";

/// Action errors
pub const ERR_301: &str = "ERR_301: Could not parse String from msg. Not compliant with CallType format";
pub const ERR_302: &str = "ERR_302: No allocations available to withdraw";