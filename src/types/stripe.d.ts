import { Stripe } from "stripe";

declare module "stripe" {
  namespace Stripe {
    namespace Checkout {
      interface Session {
        shipping?: {
          address: {
            city: string;
            country: string;
            line1: string;
            line2?: string | null;
            postal_code: string;
            state: string;
          };
          name: string;
        };
      }
    }
  }
}
