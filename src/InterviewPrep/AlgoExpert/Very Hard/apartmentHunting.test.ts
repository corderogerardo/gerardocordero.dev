describe("apartmentHunting", () => {
  it("returns the correct index of the block with the minimum distance to all requirements", () => {
    const blocks = [
      { gym: true, school: false, store: false },
      { gym: false, school: true, store: false },
      { gym: true, school: true, store: false },
      { gym: false, school: true, store: true },
      { gym: false, school: false, store: true }
    ];
    const reqs = ["gym", "school", "store"];
    const result = apartmentHunting(blocks, reqs);
    expect(result).toBe(3);
  });

  it("returns the correct index of the block with the minimum distance to all requirements when there is only one requirement", () => {
    const blocks = [
      { gym: true, school: false, store: false },
      { gym: false, school: true, store: false },
      { gym: true, school: true, store: false },
      { gym: false, school: true, store: true },
      { gym: false, school: false, store: true }
    ];
    const reqs = ["school"];
    const result = apartmentHunting(blocks, reqs);
    expect(result).toBe(2);
  });

  it("returns the correct index of the block with the minimum distance to all requirements when there is only one block", () => {
    const blocks = [{ gym: true, school: false, store: false }];
    const reqs = ["gym", "school", "store"];
    const result = apartmentHunting(blocks, reqs);
    expect(result).toBe(0);
  });
});
