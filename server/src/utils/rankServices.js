const { haversine } = require("./distance");

const emergencyPriorityMap = {
  hospital: 40,
  ambulance: 35,
  police: 30,
  towing: 20,
  mechanic: 15,
  puncture: 10,
  fuel: 5,
};

function rankServices(services, userLat, userLng) {
  const ranked = services.map((service) => {
    const distanceRaw = haversine(
      userLat,
      userLng,
      Number(service.lat),
      Number(service.lng)
    );
    const distance = Number(distanceRaw.toFixed(2));

    const emergencyPriority = emergencyPriorityMap[service.type] ?? 0;
    const distanceScore = Math.max(0, (1 - distanceRaw / 50) * 30);
    const verifiedScore = Number(service.verified) === 1 ? 20 : 0;
    const availabilityScore = Number(service.available) === 1 ? 10 : 0;
    const finalScore =
      emergencyPriority + distanceScore + verifiedScore + availabilityScore;

    return {
      ...service,
      distance,
      score: Number(finalScore.toFixed(2)),
    };
  });

  ranked.sort((a, b) => b.score - a.score);
  return ranked;
}

module.exports = { rankServices };
