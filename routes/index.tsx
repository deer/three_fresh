export default function Home() {
  const links: LinkItem[] = [
    { IslandName: "BasicCube", text: "Basic Cube" },
    { IslandName: "LightingShadows", text: "Cube with Lighting and Shadows" },
    { IslandName: "AnimatedMesh", text: "Animated Mesh" },
    { IslandName: "Tesseract", text: "Tesseract" },
    { IslandName: "Torus", text: "Torus" },
    { IslandName: "ScrollableSphere", text: "Scrollable Sphere Website" },
  ];
  return (
    <div class="px-4 py-16 mx-auto content-center">
      <h1 class="text-2xl pb-4">Some 3d Animations made with Three.js</h1>
      <ul class="list-disc">
        {links.map((link) => (
          <LinkItemComponent key={link.IslandName} item={link} />
        ))}
      </ul>
    </div>
  );
}

type LinkItem = {
  IslandName: string;
  text: string;
};

type LinkProps = {
  item: LinkItem;
};

const LinkItemComponent = ({ item }: LinkProps) => (
  <li>
    <a
      href={`/examples/${item.IslandName}`}
      class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
    >
      {item.text}
    </a>
  </li>
);
