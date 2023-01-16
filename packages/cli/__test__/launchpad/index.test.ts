import { parse } from "date-fns";

describe("Format Date", () => {
  it("should format date", () => {
    const parseDateString = "yyyy-MM-dd'T'HH:mm:ss";
    const date = parse("2023-1-12T12:00:06", parseDateString, new Date());
    expect(date.getMilliseconds()).toEqual(0);
  });
});
