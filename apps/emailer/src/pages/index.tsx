import type { NextPage } from "next";

import { render } from "@dakthar/emails/";
import {
  // NotionMagicLinkEmail,
  // PlaidVerifyIdentityEmail,
  StripeWelcomeEmail,
  // VercelInviteUserEmail,
} from "@dakthar/emails/src/examples";

// const Email = NotionMagicLinkEmail;
// const Email = PlaidVerifyIdentityEmail;
const Email = StripeWelcomeEmail;
// const Email = VercelInviteUserEmail;

const Home: NextPage = () => {
  const markup = render(<Email />, { pretty: true });
  return (
    <>
      <iframe
        title="email preview"
        srcDoc={markup}
        className="h-[calc(100vh_-_70px)] w-full"
      />
    </>
  );
};

export default Home;
