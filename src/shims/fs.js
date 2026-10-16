// reading files is done by what calls the formatter
const fs = {
  openSync(file, mode) {
    throw new Error("Files are not read by the formatter.");
  },
  closeSync(descriptor) {},
};

export default fs;
