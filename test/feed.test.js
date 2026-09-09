import { beforeEach, describe, expect, it, vi } from "vitest";

const { findRequests, findUsers } = vi.hoisted(() => ({
  findRequests: vi.fn(),
  findUsers: vi.fn(),
}));

vi.mock("../src/models/connectionRequest.js", () => ({
  default: { find: findRequests },
}));
vi.mock("../src/models/user.js", () => ({ default: { find: findUsers } }));

const { feed } = await import("../src/controllers/user.js");

const response = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("feed", () => {
  beforeEach(() => vi.clearAllMocks());

  it("excludes users involved in existing connection requests", async () => {
    findRequests.mockResolvedValue([
      { fromUserId: "current-user", toUserId: "hidden-user" },
    ]);
    const limit = vi.fn().mockResolvedValue([{ _id: "visible-user" }]);
    const skip = vi.fn().mockReturnValue({ limit });
    const select = vi.fn().mockReturnValue({ skip });
    findUsers.mockReturnValue({ select });
    const res = response();

    await feed({ user: { _id: "current-user" }, query: {} }, res);

    expect(findUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        $and: expect.arrayContaining([
          expect.objectContaining({ _id: { $nin: ["current-user", "hidden-user"] } }),
        ]),
      }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: [{ _id: "visible-user" }] }),
    );
  });
});
