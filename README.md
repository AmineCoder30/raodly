# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Local learning database

Roadly uses `expo-sqlite` in [src/database](./src/database) with versioned
migrations. Roadmaps and ordered topics are stored separately from
user-owned selections and topic progress. UUIDs are generated once for local
records and can be supplied by a remote content source during an upsert, so
repeated synchronization is idempotent.

The database keeps ISO 8601 timestamps and soft-deletes remote content with
`deleted_at`. A future Supabase sync should:

1. Pull a remote change cursor or revision feed, not only compare
   `updated_at`; commit each sync page in a transaction.
2. Upsert records by UUID using an explicit conflict policy (remote wins for
   published content and local wins for user progress).
3. Apply tombstones after dependent records are handled, retaining them until
   the server confirms the deletion.
4. Persist the cursor only after the transaction commits, then retry the
   unfinished page after interruption.

The migration archives progress from the original lesson cache table when
necessary because those legacy topic IDs do not have roadmap parent rows yet.: Chat with Expo users and ask questions.

The UI-facing state layer is [src/stores/roadmapStore.ts](./src/stores/roadmapStore.ts).
It keeps SQLite as the source of truth and exposes async actions for hydration,
roadmap/topic upserts, roadmap selection, and topic progress:

```tsx
import { useEffect } from "react";
import { useRoadmapStore } from "@/stores/roadmapStore";

const { roadmaps, hydrate, loadRoadmap } = useRoadmapStore();

useEffect(() => {
  void hydrate();
}, [hydrate]);
```

Use selectors in screens when possible, for example
`useRoadmapStore((state) => state.roadmaps)`, to avoid unnecessary renders.: Chat with Expo users and ask questions.

The content hierarchy is `roadmaps -> roadmap_sections -> roadmap_topics ->
topic_lessons`. `topic_progress` is user-scoped and is joined while loading a
roadmap, so the UI mapper can produce the existing
`{ id, title, topics: [{ id, title, completed }] }` shape without storing a
shared `completed` flag in content tables.: Chat with Expo users and ask questions.
