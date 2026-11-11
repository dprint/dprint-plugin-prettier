// @nts-check
/** @returns {boolean} */ function hasStringOrFunction(/** @type {any[]} */ groupList) {
  return groupList.some(
    /** @returns {boolean} */ (group) =>
      group.type === "string" ||
      (group.type === "func" &&
        // workaround false-positive func
        !group.value.endsWith("\\")),
  );
}

export default hasStringOrFunction;
