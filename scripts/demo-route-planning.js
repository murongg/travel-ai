#!/usr/bin/env node

/**
 * 高德地图路径规划功能演示脚本
 * 展示如何使用路径规划API
 */

const API_BASE_URL = 'http://localhost:3000/api/amap/route-planning';

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

// 演示函数
async function demonstrateRoutePlanning() {
  console.log('🚗 高德地图路径规划2.0功能演示\n');

  try {
    // 1. 测试API状态
    console.log('1️⃣ 检查API状态...');
    const statusResponse = await fetch(`${API_BASE_URL}`);
    const statusData = await statusResponse.json();
    
    if (statusData.success) {
      console.log('✅ API状态正常');
      console.log(`   速率限制: ${statusData.data.rateLimit.recentRequestsCount}/${statusData.data.rateLimit.maxRequestsPerSecond}`);
      console.log(`   支持功能: ${Object.keys(statusData.data.features).join(', ')}\n`);
    } else {
      console.log('❌ API状态异常');
      return;
    }

    // 2. 测试多日行程路径规划
    console.log('2️⃣ 测试多日行程路径规划...');
    const multiDayResponse = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'multiDay',
        data: {
          itinerary: sampleItinerary,
          destination: '北京'
        }
      }),
    });

    const multiDayData = await multiDayResponse.json();
    
    if (multiDayData.success) {
      console.log('✅ 多日行程路径规划成功');
      console.log(`   总天数: ${multiDayData.data.totalDays}`);
      console.log(`   总距离: ${multiDayData.data.summary.totalDistance}公里`);
      console.log(`   总时间: ${multiDayData.data.summary.totalDuration}小时`);
      console.log(`   总费用: ¥${multiDayData.data.summary.totalCost}\n`);
      
      // 显示每日详情
      multiDayData.data.dailyRoutes.forEach((route, index) => {
        console.log(`   第${route.day}天: ${route.title}`);
        console.log(`     距离: ${(route.totalDistance / 1000).toFixed(1)}公里`);
        console.log(`     时间: ${Math.round(route.totalDuration / 60)}分钟`);
        console.log(`     费用: ¥${route.totalCost.toFixed(2)}`);
        console.log(`     途经点: ${route.waypoints.length}个\n`);
      });
    } else {
      console.log('❌ 多日行程路径规划失败:', multiDayData.error);
    }

    // 3. 测试单次路径规划
    console.log('3️⃣ 测试单次路径规划...');
    const singleRouteResponse = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'single',
        data: {
          origin: '116.397428,39.90923', // 天安门
          destination: '116.404,39.915',   // 故宫
          strategy: 0 // 速度最快
        }
      }),
    });

    const singleRouteData = await singleRouteResponse.json();
    
    if (singleRouteData.success) {
      console.log('✅ 单次路径规划成功');
      console.log(`   距离: ${(parseInt(singleRouteData.data.distance) / 1000).toFixed(1)}公里`);
      console.log(`   时间: ${Math.round(parseInt(singleRouteData.data.duration) / 60)}分钟`);
      console.log(`   路径步骤: ${singleRouteData.data.steps.length}步\n`);
    } else {
      console.log('❌ 单次路径规划失败:', singleRouteData.error);
    }

    console.log('🎉 演示完成！');

  } catch (error) {
    console.error('❌ 演示过程中出现错误:', error.message);
    console.log('\n💡 请确保：');
    console.log('   1. 开发服务器正在运行 (npm run dev)');
    console.log('   2. 环境变量 NEXT_PUBLIC_AMAP_KEY 已正确设置');
    console.log('   3. 高德地图API密钥有效且具有必要权限');
  }
}

// 运行演示
if (require.main === module) {
  demonstrateRoutePlanning();
}

module.exports = { demonstrateRoutePlanning, sampleItinerary };
