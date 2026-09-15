import { beforeEach, describe, expect, it, vi } from "vitest";

const { findOne } = vi.hoisted(() => ({ findOne: vi.fn() }));

vi.mock("../src/models/connectionRequest.js", () => ({
  default: { findOne },
}));

const { isUserAlreadyFriendForChat } = await import(
  "../src/validators/chat.js"
);

describe("chat authorization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows accepted connections to open a chat", async () => {
    findOne.mockResolvedValue({ _id: "connection-id" });
    const next = vi.fn();

    await isUserAlreadyFriendForChat(
      { user: { _id: "507f1f77bcf86cd799439011" }, params: { receiverId: "507f191e810c19729de860ea" } },
      {},
      next,
    );

    expect(next).toHaveBeenCalledOnce();
  });

  it("blocks users who are not accepted connections", async () => {
    findOne.mockResolvedValue(null);
    const next = vi.fn();

    await isUserAlreadyFriendForChat(
      { user: { _id: "507f1f77bcf86cd799439011" }, params: { receiverId: "507f191e810c19729de860ea" } },
      {},
      next,
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403, isOperational: true }),
    );
  });
});
