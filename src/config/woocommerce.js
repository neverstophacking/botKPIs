import dotenv from "dotenv";
dotenv.config();
export const woocommerceConfig = {
    url: process.env.WOO_URL ?? "",
    consumerKey: process.env.WOO_CONSUMER_KEY ?? "",
    consumerSecret: process.env.WOO_CONSUMER_SECRET ?? "",
};
//# sourceMappingURL=woocommerce.js.map