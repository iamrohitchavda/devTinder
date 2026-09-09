import { beforeEach, describe, expect, it, vi } from "vitest";

const { emitMatchCreated, findById, findOne } = vi.hoisted(() => ({
  emitMatchCreated: vi.fn(),
  findById: vi.fn(),
  findOne: vi.fn(),
}));

vi.mock("../src/models/connectionRequest.js", () => ({
  default: { findOne },
}));
vi.mock("../src/models/user.js", () => ({ default: { findById } }));
vi.mock("../src/utils/sendEmail.js", () => ({ sendEmail: vi.fn() }));
vi.mock("../src/utils/socket.js", () => ({ emitMatchCreated }));

const { swipeDeveloper } = await import("../src/controllers/swipe.js");

const response = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("mutual swipe", () => {
  beforeEach(() => vi.clearAllMocks());

  it("turns a reverse interested swipe into an accepted match", async () => {
    const request = {
      fromUserId: "sender-user",
      status: "interested",
      save: vi.fn().mockResolvedValue({ _id: "swipe-id", status: "accepted" }),
    };
    findOne.mockResolvedValue(request);
    findById
      .mockResolvedValueOnce({ _id: "sender-user", email: "sender@example.com" })
      .mockReturnValue({
        select: vi.fn().mockResolvedValue({ _id: "user-id", firstName: "Dev" }),
      });
    const res = response();

    await swipeDeveloper(
      {
        user: { _id: "current-user" },
        params: { action: "interested", targetUserId: "sender-user" },
      },
      res,
    );

    expect(request.status).toBe("accepted");
    expect(request.save).toHaveBeenCalledOnce();
    expect(emitMatchCreated).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: expect.objectContaining({ isMatch: true }) }),
    );
  });
});
