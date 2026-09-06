export function createRecommendationsController(
  service
) {
  return {
    list: async (req, res) => {
      const recommendations =
        await service.list(
          req.auth.user.id
        );

      res.json({
        data: recommendations
      });
    }
  };
}
