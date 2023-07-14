use std::path::Path;

pub struct Snapshot(Box<[u8]>);

impl Snapshot {
  pub fn from_path(file_path: &Path) -> std::io::Result<Self> {
    Self::deserialize(&std::fs::read(file_path)?)
  }

  pub fn deserialize(data: &[u8]) -> std::io::Result<Self> {
    // compressing takes about a minute in debug, so only do it in release
    if cfg!(debug_assertions) {
      Ok(Self(data.to_vec().into_boxed_slice()))
    } else {
      Ok(Self(
        zstd::bulk::decompress(
          &data[4..],
          u32::from_le_bytes(data[0..4].try_into().unwrap()) as usize,
        )?
        .into_boxed_slice(),
      ))
    }
  }

  pub(crate) fn inner(&self) -> &[u8] {
    &self.0
  }

  pub(crate) fn into_inner(self) -> Box<[u8]> {
    self.0
  }
}
