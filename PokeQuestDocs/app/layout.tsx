import { Footer, LastUpdated, Layout, Navbar } from "nextra-theme-docs";
import { Head, Search } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";
import Logo from "../public/Logo.png";
import Image from "next/image";
import "./globals.css";

export const metadata = {
  title: "FindGroup.gg",
};

const lastUpdated = (
  <LastUpdated locale='hu-HU'>Utoljára frissítve</LastUpdated>
)

const navbar = (
  <Navbar
    logo={
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Image src={Logo} alt="FindGroup.gg Logo" width={40} height={40} />
        <b>FindGroup.gg</b>
      </div>
    }
    logoLink={"https://github.com/Ordinary56"}
    projectLink="https://github.com/Ordinary56/FindGroup.gg"
    chatLink="https://discord.gg/nAey9rqTER"
    />
);
const footer = (
  <Footer>{new Date().getFullYear()} © FindGroup.gg.</Footer>

);

const search = <Search placeholder="Keresés.."></Search>;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      // Not required, but good for SEO
      lang="hu"
      // Required to be set
      dir="ltr"
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
    >
      <Head
      // ... Your additional head options
      >
        {/* Your additional tags should be passed as `children` of `<Head>` element */}
      </Head>
      <body>
        <Layout
          toc={{title: "Ezen oldal tartalma", backToTop:"Vissza az oldalal tetejére"}}
          navbar={navbar}
          themeSwitch={{ light: "🌞 Világos mód", dark: "🌙 Sötét mód", system: "💻 Rendszer" }}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/PLACKO135/FindgroupDocs"
          footer={footer}
          search={search}
          editLink={null}
          feedback={{ content: null }}
          lastUpdated={lastUpdated}
          
        // ... Your additional layout options
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
