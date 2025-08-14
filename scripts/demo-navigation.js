#!/usr/bin/env node

/**
 * 高德地图导航功能演示脚本
 * 展示如何生成导航链接
 */

// 模拟行程数据
const sampleItinerary = [
  {
    day: 1,
    title: '第一天 - 故宫天安门',
    destination: '北京',
    activities: [
      {
        time: '09:00',
        name: '天安门广场',
        description: '参观天安门广场，观看升旗仪式',
        location: '天安门广场',
        duration: '2小时',
        cost: '免费'
      },
      {
        time: '11:00',
        name: '故宫博物院',
        description: '游览故宫，了解明清历史',
        location: '故宫博物院',
        duration: '3小时',
        cost: '¥60'
      }
    ],
    meals: [
      {
        type: 'lunch',
        name: '全聚德烤鸭',
        location: '全聚德烤鸭店',
        cost: '¥200',
        description: '品尝正宗北京烤鸭'
      }
    ],
    accommodation: '北京饭店'
  },
  {
    day: 2,
    title: '第二天 - 长城颐和园',
    destination: '北京',
    activities: [
      {
        time: '08:00',
        name: '八达岭长城',
        description: '登长城，感受万里长城的气势',
        location: '八达岭长城',
        duration: '4小时',
        cost: '¥120'
      },
      {
        time: '14:00',
        name: '颐和园',
        description: '游览颐和园，欣赏皇家园林',
        location: '颐和园',
        duration: '3小时',
        cost: '¥60'
      }
    ],
    meals: [
      {
        type: 'lunch',
        name: '农家院',
        location: '长城脚下农家院',
        cost: '¥80',
        description: '品尝农家菜'
      }
    ],
    accommodation: '北京饭店'
  }
];

/**
 * 生成高德地图导航链接
 */
function generateAmapNavigationUrl(locations, city, mode = 'car', preference = '0') {
  if (locations.length === 0) return '';
  
  // 使用更强大的 ditu.amap.com/dir 格式
  const baseUrl = 'https://ditu.amap.com/dir';
  const params = new URLSearchParams();
  
  // 设置起点（城市中心）
  params.append('from[name]', city);
  params.append('from[id]', 'citycenter');
  params.append('from[adcode]', ''); // 可以留空，让高德地图自动识别
  
  // 设置终点（最后一个地点）
  const lastLocation = locations[locations.length - 1];
  params.append('to[name]', lastLocation.location);
  params.append('to[id]', 'destination');
  
  // 设置途经点（如果有多个地点）
  if (locations.length > 2) {
    const waypoints = locations.slice(0, -1);
    waypoints.forEach((loc, index) => {
      params.append(`waypoint[${index}][name]`, loc.location);
      params.append(`waypoint[${index}][id]`, `waypoint_${index}`);
    });
  }
  
  // 设置导航模式
  params.append('type', mode);
  
  // 设置策略
  params.append('policy', preference);
  
  // 设置坐标系（高德坐标系）
  params.append('coordinate', 'gaode');
  
  // 设置是否显示路况
  params.append('showTraffic', '1');
  
  // 设置是否显示POI
  params.append('showPOI', '1');
  
  // 设置是否显示建筑物
  params.append('showBuilding', '1');
  
  // 设置是否显示3D视图
  params.append('show3D', '1');
  
  // 设置缩放级别
  params.append('zoom', '13');
  
  // 设置是否自动开始导航
  params.append('autoStart', '1');
  
  // 设置是否显示导航面板
  params.append('showPanel', '1');
  
  // 设置导航语言（中文）
  params.append('url', 'zh_cn');
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * 演示导航链接生成
 */
function demonstrateNavigation() {
  console.log('🗺️ 高德地图导航功能演示\n');

  try {
    // 为每一天生成导航链接
    const dailyRoutes = sampleItinerary.map(dayPlan => {
      const locations = [];
      
      // 收集所有地点
      if (dayPlan.activities) {
        dayPlan.activities.forEach(activity => {
          if (activity.location) {
            locations.push({
              name: activity.name || '活动',
              location: activity.location,
              type: 'attraction'
            });
          }
        });
      }

      if (dayPlan.meals) {
        dayPlan.meals.forEach(meal => {
          if (meal.location) {
            locations.push({
              name: meal.name || `${meal.type}餐厅`,
              location: meal.location,
              type: 'restaurant'
            });
          }
        });
      }

      if (dayPlan.accommodation) {
        locations.push({
          name: dayPlan.accommodation,
          location: dayPlan.accommodation,
          type: 'hotel'
        });
      }

      return {
        day: dayPlan.day,
        title: dayPlan.title,
        locations,
        navigationUrl: generateAmapNavigationUrl(locations, dayPlan.destination)
      };
    });

    console.log('✅ 导航链接生成成功\n');
    
    // 显示每日导航信息
    dailyRoutes.forEach((route, index) => {
      console.log(`第${route.day}天: ${route.title}`);
      console.log(`  地点数量: ${route.locations.length}`);
      console.log(`  地点列表:`);
      route.locations.forEach((loc, locIndex) => {
        console.log(`    ${locIndex + 1}. ${loc.name} (${loc.type}) - ${loc.location}`);
      });
      console.log(`  导航链接: ${route.navigationUrl}`);
      console.log('');
    });

    // 展示不同导航模式的效果
    console.log('🚗 不同导航模式示例:');
    const sampleLocations = dailyRoutes[0].locations;
    
    const modes = [
      { mode: 'car', preference: '0', name: '驾车-速度最快' },
      { mode: 'car', preference: '1', name: '驾车-费用最低' },
      { mode: 'car', preference: '2', name: '驾车-距离最短' },
      { mode: 'walk', preference: '0', name: '步行' },
      { mode: 'transit', preference: '0', name: '公交' },
      { mode: 'bike', preference: '0', name: '骑行' }
    ];
    
    modes.forEach(({ mode, preference, name }) => {
      const url = generateAmapNavigationUrl(sampleLocations, '北京', mode, preference);
      console.log(`  ${name}: ${url}`);
    });
    console.log('');

    console.log('🎉 演示完成！');
    console.log('\n💡 使用说明:');
    console.log('   1. 复制导航链接到浏览器');
    console.log('   2. 或直接点击链接跳转到高德地图');
    console.log('   3. 在高德地图中查看详细路线和导航');

  } catch (error) {
    console.error('❌ 演示过程中出现错误:', error.message);
  }
}

// 运行演示
if (require.main === module) {
  demonstrateNavigation();
}

module.exports = { demonstrateNavigation, sampleItinerary, generateAmapNavigationUrl };
