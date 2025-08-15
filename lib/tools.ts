export interface PackingItem {
  id: string
  name: string
  category: string
  essential: boolean
  quantity?: number
  packed?: boolean
}

export interface PackingList {
  destination: string
  season: string
  duration: number
  tripType: string
  items: PackingItem[]
}
export interface WeatherInfo {
  location?: string
  current: {
    temperature: string
    condition: string
    humidity: string
    windSpeed: string
    windDirection: string
    reportTime: string
  }
  forecast: Array<{
    date: string // YYYY-MM-DD 格式
    readableDate: string // 可读格式，如"3月15日"
    week: string // 周几，如"周一"
    dayWeather: string
    nightWeather: string
    dayTemp: string
    nightTemp: string
    dayWind: string
    nightWind: string
    dayPower: string
    nightPower: string
  }>
  advice: string
  startDate?: string
  endDate?: string
  duration?: number
}

export const toolsService = {
  generatePackingList: async (
    destination: string,
    season: string,
    duration: number,
    tripType: string,
  ): Promise<PackingList> => {
    try {
      const response = await fetch("/api/tools/packing-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ destination, season, duration, tripType }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate packing list")
      }

      const data = await response.json()
      return data.packingList
    } catch (error) {
      console.error("Error generating packing list:", error)
      throw error
    }
  },

  getWeatherInfo: async (location: string, startDate?: string, duration?: number): Promise<WeatherInfo> => {
    try {
      const params = new URLSearchParams({
        city: location
      });

      if (startDate) {
        params.append('startDate', startDate);
      }

      if (duration) {
        params.append('duration', duration.toString());
      }

      const response = await fetch(`/api/weather?${params}`)

      if (!response.ok) {
        throw new Error("Failed to fetch weather info")
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "获取天气信息失败")
      }

      // 解析天气建议文本，提取结构化数据
      const weatherAdvice = data.data.weatherAdvice
      const lines = weatherAdvice.split('\n')

      // 提取当前天气信息
      const current: WeatherInfo['current'] = {
        temperature: '',
        condition: '',
        humidity: '',
        windSpeed: '',
        windDirection: '',
        reportTime: ''
      }

      lines.forEach((line: string) => {
        if (line.includes('当前温度：')) {
          current.temperature = line.split('：')[1].replace('°C', '')
        } else if (line.includes('天气状况：')) {
          current.condition = line.split('：')[1]
        } else if (line.includes('湿度：')) {
          current.humidity = line.split('：')[1].replace('%', '')
        } else if (line.includes('风向：')) {
          const windInfo = line.split('：')[1]
          current.windDirection = windInfo.split(' ')[0]
          current.windSpeed = windInfo.split(' ')[1].replace('级', '')
        } else if (line.includes('更新时间：')) {
          current.reportTime = line.split('：')[1]
        }
      })

      // 提取预报信息（支持日期和行程天数）
      const forecast: WeatherInfo['forecast'] = []

      lines.forEach((line: string) => {
        // 支持多种日期格式：今天、明天、后天，或者具体的日期
        if (line.includes('：') && (line.includes('转') || line.includes('°C'))) {
          const parts = line.split('：')
          if (parts.length >= 2) {
            const dayLabel = parts[0]
            const weatherInfo = parts[1]

            // 解析天气信息
            let dayWeather = '';
            let nightWeather = '';
            let dayTemp = '';
            let nightTemp = '';

            if (weatherInfo.includes('转')) {
              const [day, temp] = weatherInfo.split('，')
              dayWeather = day || '';
              nightWeather = day.includes('转') ? day.split('转')[1] : day;

              if (temp && temp.includes('°C')) {
                const tempParts = temp.split('°C')
                dayTemp = tempParts[0] || '';
                nightTemp = tempParts[1] || '';
              }
            } else {
              dayWeather = weatherInfo;
            }

            const currentForecast = {
              date: dayLabel,
              readableDate: dayLabel,
              week: dayLabel,
              dayWeather: dayWeather,
              nightWeather: nightWeather,
              dayTemp: dayTemp,
              nightTemp: nightTemp,
              dayWind: '',
              nightWind: '',
              dayPower: '',
              nightPower: ''
            }

            forecast.push(currentForecast)
          }
        }
      })

      return {
        location,
        current,
        forecast,
        advice: weatherAdvice
      }
    } catch (error) {
      console.error("Error fetching weather info:", error)
      throw error
    }
  },
}

// Helper function to get auth headers
function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}
