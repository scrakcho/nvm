"use strict";

const common = require("../../lib/common");

describe("common.getRemoteFromJson", function() {
  this.timeout(30000);
  it("should get versions", async () => {
    await common.getRemoteFromJson();
  });
});
