use serde::{Deserialize, Deserializer, Serialize, Serializer};

macro_rules! impl_str_type {
    ($iden: ident, $ty: tt) => {
        #[derive(Debug, Clone, Copy, PartialEq)]
        pub struct $iden(pub $ty);

        impl From<$ty> for $iden {
            fn from(v: $ty) -> Self {
                Self(v)
            }
        }

        impl From<$iden> for $ty {
            fn from(v: $iden) -> $ty {
                v.0
            }
        }

        impl Serialize for $iden {
            fn serialize<S>(
                &self,
                serializer: S,
            ) -> Result<<S as Serializer>::Ok, <S as Serializer>::Error>
            where
                S: Serializer,
            {
                serializer.serialize_str(&self.0.to_string())
            }
        }

        impl<'de> Deserialize<'de> for $iden {
            fn deserialize<D>(deserializer: D) -> Result<Self, <D as Deserializer<'de>>::Error>
            where
                D: Deserializer<'de>,
            {
                let s: String = Deserialize::deserialize(deserializer)?;
                Ok(Self($ty::from_str_radix(&s, 10).map_err(|err| {
                    serde::de::Error::custom(err.to_string())
                })?))
            }
        }
    };
}

impl_str_type!(U128, u128);
impl_str_type!(U64, u64);
impl_str_type!(I128, i128);
impl_str_type!(I64, i64);
