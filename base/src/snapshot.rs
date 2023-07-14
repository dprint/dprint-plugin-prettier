pub struct CompressedSnapshot(Box<[u8]>);

impl CompressedSnapshot {
  pub fn deserialize(compressed_data: &[u8]) -> std::io::Result<Self> {
    Ok(Self(
      zstd::bulk::decompress(
        &compressed_data[4..],
        u32::from_le_bytes(compressed_data[0..4].try_into().unwrap()) as usize,
      )?
      .into_boxed_slice(),
    ))
  }

  pub(crate) fn inner(&self) -> &[u8] {
    &self.0
  }
}
