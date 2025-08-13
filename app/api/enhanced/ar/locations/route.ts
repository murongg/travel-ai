import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = Number.parseFloat(searchParams.get("lat") || "0")
    const lng = Number.parseFloat(searchParams.get("lng") || "0")
    const radius = Number.parseInt(searchParams.get("radius") || "1000")

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    // Mock AR location data
    const mockLocations = [
      {
        id: "poi-1",
        name: "东京塔",
        type: "landmark",
        coordinates: {
          lat: lat + 0.001,
          lng: lng + 0.001,
        },
        distance: 150,
        description: "东京的标志性建筑，高333米",
        arData: {
          modelUrl: "/models/tokyo-tower.glb",
          scale: 1.0,
          rotation: { x: 0, y: 0, z: 0 },
        },
        info: {
          openingHours: "09:00-23:00",
          ticketPrice: "¥1,200",
          rating: 4.5,
        },
      },
      {
        id: "poi-2",
        name: "便利店 7-Eleven",
        type: "store",
        coordinates: {
          lat: lat - 0.0005,
          lng: lng + 0.0008,
        },
        distance: 80,
        description: "24小时便利店",
        arData: {
          modelUrl: "/models/convenience-store.glb",
          scale: 0.8,
          rotation: { x: 0, y: 45, z: 0 },
        },
        info: {
          openingHours: "24小时",
          services: ["ATM", "复印", "快递"],
        },
      },
      {
        id: "poi-3",
        name: "地铁站入口",
        type: "transport",
        coordinates: {
          lat: lat + 0.0008,
          lng: lng - 0.0003,
        },
        distance: 120,
        description: "银座线 新桥站",
        arData: {
          modelUrl: "/models/subway-entrance.glb",
          scale: 1.2,
          rotation: { x: 0, y: 90, z: 0 },
        },
        info: {
          lines: ["银座线", "浅草线"],
          nextTrain: "2分钟",
        },
      },
    ]

    // Filter by radius
    const filteredLocations = mockLocations.filter((loc) => loc.distance <= radius)

    return NextResponse.json({
      success: true,
      locations: filteredLocations,
      userLocation: { lat, lng },
      radius,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
