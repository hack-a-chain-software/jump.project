import { viewMethod } from "../../dist/helper/near";

test("viewMethod", async () => {
  const priceTokenMetadata = await viewMethod(
    "ftv2.nekotoken.near",
    "ft_metadata",
    {}
  ).catch((err) => {
    console.log(err);
  });
  expect(priceTokenMetadata).toBeDefined();
  expect(priceTokenMetadata).toHaveProperty("spec");
});
