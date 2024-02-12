import { type PageProps } from "$fresh/server.ts";
import { GithubCorner } from "../components/Icons.tsx";
export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>three_fresh</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body class="flex overflow-x-hidden">
        <a
          href="https://github.com/deer/three_fresh"
          target="_blank"
          class="absolute top-0 right-0 z-20"
        >
          <GithubCorner />
        </a>
        <Component />
      </body>
    </html>
  );
}
