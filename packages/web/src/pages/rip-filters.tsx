// TODO: fazer isso no nível de graphql
type ListingStatus =
  | "unfunded"
  | "funded"
  | "sale_finalized"
  | "pool_created"
  | "pool_project_token_sent"
  | "pool_price_token_sent"
  | "liquidity_pool_finalized"
  | "cancelled";
type ProjectStatus = "open" | "closed";
// TODO: validar isso pelo amor de deus
const projectStatusMap: Record<ListingStatus, ProjectStatus> = {
  unfunded: "open", // ignore
  funded: "open",
  sale_finalized: "open",
  pool_created: "open",
  pool_project_token_sent: "open",
  pool_price_token_sent: "open",
  liquidity_pool_finalized: "closed",
  cancelled: "closed",
};

type Filter = {
  filter: string;
  test: (project: LaunchpadListing, filter: string) => boolean;
};

// const items = useMemo(() => {
//   if (!launchpadProjects) {
//     return [...Array(2)];
//   }

//   const filter: Filter[] = [
//     {
//       filter: filterStatus,
//       test: (project, filter) =>
//         filter === projectStatusMap[project.status as ProjectStatus],
//     },
//     {
//       filter: filterSearch,
//       test: (project, filter) =>
//         [
//           project.project_token, // Address
//           project.project_token_info?.name,
//           project.project_name,
//         ].some((field) => field?.includes(filter)),
//     },
//     // {
//     //   filter: filterVisibility,
//     //   field: ''
//     // },
//     // {
//     //   filter: filterMine,
//     //   field: ''
//     // }
//   ];

//   return launchpadProjects?.data?.filter((project) =>
//     filter.every(
//       ({ filter, test }) => !filter || (project && test(project, filter))
//     )
//   );
// }, [
//   filterMine,
//   filterStatus,
//   filterSearch,
//   filterVisibility,
//   launchpadProjects,
// ]);
