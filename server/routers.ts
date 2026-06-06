import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  version: router({
    latest: publicProcedure.query(() => ({
      latestVersion: "1.0.21",
      downloadUrl: "https://expensetrk-9vdpakjp.manus.space",
      releaseNotes: "Critical update with receipt photo attachments",
      changelog: [
        "Added receipt photo attachment for transactions",
        "Users can now capture or select photos from gallery",
        "Photo indicator badges on transaction cards",
        "Fullscreen photo viewer for receipts",
        "Persistent photo storage with transactions",
        "Improved photo picker with camera/library options",
      ],
      forceUpdate: false,
    })),
  }),
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
