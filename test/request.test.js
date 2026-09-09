import { beforeEach, describe, expect, it, vi } from "vitest";

const { findOne } = vi.hoisted(() => ({ findOne: vi.fn() }));

vi.mock("../src/models/connectionRequest.js", () => ({
  default: { findOne },
}));
vi.mock("../src/models/user.js", () => ({ default: {} }));
vi.mock("../src/utils/sendEmail.js", () => ({ sendEmail: vi.fn() }));

const { requestReview } = await import("../src/controllers/request.js");

const response = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("request review", () => {
  beforeEach(() => vi.clearAllMocks());

  it("accepts an incoming interested request", async () => {
    const request = {
      status: "interested",
      save: vi.fn().mockResolvedValue({ _id: "request-id", status: "accepted" }),
    };
    findOne.mockResolvedValue(request);
    const res = response();

    await requestReview(
      {
        user: { _id: "current-user" },
        params: { status: "accepted", requestId: "request-id" },
      },
      res,
    );

    expect(request.status).toBe("accepted");
    expect(request.save).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});
