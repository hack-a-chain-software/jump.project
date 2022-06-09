/// Contract errors
pub const ERR_001: &str = "ERR_001: Only owner can call this method";
pub const ERR_002: &str = "ERR_002: Only owner or guardian can call this method";
pub const ERR_003: &str = "ERR_003: listing_id does not exist";
pub const ERR_004: &str = "ERR_004: investor is not registered";


/// Listing errors
pub const ERR_101: &str = "ERR_101: Can only cancel funded listings before their start date";
pub const ERR_102: &str = "ERR_102: Only the project owner can call this method";
pub const ERR_103: &str = "ERR_103: Can only withdraw funds after sale is finalized or cancelled";
pub const ERR_104: &str = "ERR_104: Transferred token doesn't match listing token type";
pub const ERR_105: &str = "ERR_105: Trasnferred quantity doesn't match listing requirement";

/// Investor errors
pub const ERR_201: &str = "ERR_201: Storage deposit insufficient for this transaction";
pub const ERR_202: &str = "ERR_202: Storage deposited was less tha minimum deposit";