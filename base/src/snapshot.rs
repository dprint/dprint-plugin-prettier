pub fn deserialize_snapshot(data: &[u8]) -> std::io::Result<Box<[u8]>> {
  // compressing takes about a minute in debug, so only do it in release
  if cfg!(debug_assertions) {
    Ok(data.to_vec().into_boxed_slice())
  } else {
    Ok(
      zstd::bulk::decompress(
        &data[4..],
        u32::from_le_bytes(data[0..4].try_into().unwrap()) as usize,
      )?
      .into_boxed_slice(),
    )
  }
}
