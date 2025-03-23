/**
 * 小丑游戏陷阱系统
 * 实现随机触发的各种陷阱效果
 */

// 陷阱状态管理
const trapState = {
  isSpeedTrapActive: false,
  isSlowTrapActive: false,
  isJokerCloneTrapActive: false,
  isDoubleHitTrapActive: false
};

// 全局变量，跟踪是否有陷阱正在激活
let isAnyTrapActive = false;

// 检查是否有陷阱正在激活
function checkIfAnyTrapActive() {
  return trapState.isSpeedTrapActive || 
         trapState.isSlowTrapActive || 
         trapState.isJokerCloneTrapActive ||
         trapState.isDoubleHitTrapActive;

}

// 陷阱概率配置对象，可以直接调整各个陷阱的出现概率
const trapProbabilities = {
  speedTrap: 0.25,     // 加速陷阱概率
  slowTrap: 0.3,      // 减速陷阱概率
  jokerCloneTrap: 0.2, // 分身陷阱概率
  doubleHitTrap:0.25 //双击陷阱概率
};


// 初始化陷阱系统
function initTrapSystem() {
  console.log("初始化陷阱系统");
  
  // 添加样式
  addTrapStyles();
  
}

//小丑分身陷阱
function activateJokerCloneTrap(){
  // 如果陷阱已经激活，则返回
  if (trapState.isJokerCloneTrapActive) return;
  
  console.log('激活小丑分身陷阱'); 
  trapState.isJokerCloneTrapActive = true;
  
  // 显示通知
  showSimpleNotification("陷阱触发！小丑分身出现！");
  
  // 创建小丑分身
  const jokerClone = document.createElement("img");
  jokerClone.src = "./assets/joker-icon.png";
  jokerClone.classList.add("joker-target");
  jokerClone.id = "joker-clone";
  jokerClone.classList.add("joker-clone");
  
  // 随机定位分身
  const gameArea = document.querySelector(".game-area");
  const gameAreaRect = gameArea.getBoundingClientRect();
  const cloneSize = 80; // 分身大小设置为80px，比原来的大
  
  // 计算安全区域，避免分身超出游戏区域
  const maxX = gameAreaRect.width - cloneSize;
  const maxY = gameAreaRect.height - cloneSize;
  
  // 随机位置，但距离原始小丑至少80px
  const originalJoker = document.getElementById("joker-target");
  const originalJokerRect = originalJoker.getBoundingClientRect();
  let cloneX, cloneY;
  
  do {
    cloneX = Math.floor(Math.random() * maxX);
    cloneY = Math.floor(Math.random() * maxY);
  } while (
    Math.abs(cloneX - (originalJokerRect.left - gameAreaRect.left)) < 100 &&
    Math.abs(cloneY - (originalJokerRect.top - gameAreaRect.top)) < 100
  );
  
  jokerClone.style.position = "absolute";
  jokerClone.style.left = cloneX + "px";
  jokerClone.style.top = cloneY + "px";
  jokerClone.style.width = cloneSize + "px";
  jokerClone.style.height = cloneSize + "px";
  jokerClone.style.cursor = "pointer";
  jokerClone.style.zIndex = "100"; // 确保分身在前面
  
  // 为分身小丑添加样式区别
  jokerClone.style.border = "3px dashed red"; // 添加红色虚线边框
  jokerClone.style.borderRadius = "50%"; // 圆形边框
  jokerClone.style.boxShadow = "0 0 15px rgba(255, 0, 0, 0.8)"; // 增强红色发光效果
  
  // 添加文字标记
  const cloneLabel = document.createElement("div");
  cloneLabel.textContent = "假的";
  cloneLabel.style.position = "absolute";
  cloneLabel.style.top = "-20px";
  cloneLabel.style.left = "50%";
  cloneLabel.style.transform = "translateX(-50%)";
  cloneLabel.style.backgroundColor = "red";
  cloneLabel.style.color = "white";
  cloneLabel.style.padding = "2px 8px";
  cloneLabel.style.borderRadius = "10px";
  cloneLabel.style.fontSize = "14px";
  cloneLabel.style.fontWeight = "bold";
  cloneLabel.style.zIndex = "101";
  jokerClone.appendChild(cloneLabel);
  
  // 添加复合动画：旋转 + 颜色闪烁
  jokerClone.style.animation = "spin 3s linear infinite, colorPulse 2s ease-in-out infinite";
  
  // 添加点击事件，点击分身时减少点击次数
  jokerClone.addEventListener("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // 减少点击次数
    if (window.hits_count > 0) {
      window.hits_count -= 1;
      // 更新显示
      if (typeof window.updateHits === 'function') {
        window.updateHits();
      }
      // 显示通知
      showSimpleNotification("点击了分身！点击次数-1！");
    }
    
    // 移除分身
    if (jokerClone.parentNode) {
      gameArea.removeChild(jokerClone);
    }
  });
  
  gameArea.appendChild(jokerClone);
  
  // 创建分身移动定时器
  let cloneMoveInterval = setInterval(function() {
    // 如果分身已经不存在，停止定时器
    if (!jokerClone.parentNode) {
      clearInterval(cloneMoveInterval);
      return;
    }
    
    // 使用类似于moveJoker的逻辑移动分身
    const now = Date.now();
    
    // 获取游戏区域安全范围
    const gameAreaRect = gameArea.getBoundingClientRect();
    const minX = 0;
    const minY = 0;
    const maxX = gameAreaRect.width - cloneSize;
    const maxY = gameAreaRect.height - cloneSize;
    
    // 生成新的随机位置
    const newX = Math.random() * (maxX - minX) + minX;
    const newY = Math.random() * (maxY - minY) + minY;
    
    // 应用过渡效果
    jokerClone.style.transition = "left 0.2s ease-out, top 0.2s ease-out";
    jokerClone.style.left = `${newX}px`;
    jokerClone.style.top = `${newY}px`;
    
    // 移除过渡效果
    setTimeout(() => {
      jokerClone.style.transition = "";
    }, 200);
  }, 500); // 每500毫秒移动一次，比原始小丑移动快
  
  // 5秒后恢复正常（增加时间，给玩家更多挑战）
  setTimeout(function() {
    // 清除分身移动定时器
    clearInterval(cloneMoveInterval);
    
    // 移除小丑分身
    if (jokerClone.parentNode) {
      gameArea.removeChild(jokerClone);
    }
    
    // 重置陷阱状态
    trapState.isJokerCloneTrapActive = false;
    
    // 显示通知，延迟500毫秒显示，避免与前一个通知重叠
    setTimeout(function() {
      showSimpleNotification("陷阱结束！小丑分身消失了！");
    }, 500);
  }, 5000);
}


//========================
function activateSlowTrap(){
  if (trapState.isSlowTrapActive) return;
  
  console.log('激活减速陷阱');
  trapState.isSlowTrapActive = true;
  
  // 显示通知
  showSimpleNotification("陷阱触发！小丑减速75%！");
  
  // 获取小丑元素
  const jokerElement = document.getElementById("joker-target");
  if (jokerElement) {
    // 添加视觉效果
    jokerElement.classList.add("slow-boosted");
  }
  
  // 如果有移动间隔，减速小丑
  if (window.moveInterval) {
    // 保存当前游戏中计算的间隔
    window.originalMoveSpeed = window.currentMoveSpeed || 500;
    console.log('原始速度:', window.originalMoveSpeed);
    
    // 计算减速后的间隔（增加300%的时间 = 速度减少75%）
    const slowedSpeed = Math.min(2000, window.originalMoveSpeed * 4);
    console.log('减速后速度:', slowedSpeed);
    
    clearInterval(window.moveInterval);
    
    // 创建新的减速间隔
    window.moveInterval = setInterval(function() {
      // 直接调用小丑移动函数
      if (typeof window.moveJoker === 'function') {
        window.moveJoker();
      }
    }, slowedSpeed); // 使用计算后的减速间隔
  }
  
  // 3秒后恢复正常
  setTimeout(function() {
    // 恢复小丑外观
    if (jokerElement) {
      jokerElement.classList.remove("slow-boosted");
    }
    
    // 恢复原始移动速度
    if (window.moveInterval) {
      clearInterval(window.moveInterval);
      // 使用保存的原始速度或默认值
      const originalSpeed = window.originalMoveSpeed || 500;
      console.log('恢复到原始速度:', originalSpeed);
      
      window.moveInterval = setInterval(function() {
        if (typeof window.moveJoker === 'function') {
          window.moveJoker();
        }
      }, originalSpeed); // 恢复到原始速度
    }
    
    // 重置陷阱状态
    trapState.isSlowTrapActive = false;
    
    // 显示通知，延迟500毫秒显示，避免与前一个通知重叠
    setTimeout(function() {
      showSimpleNotification("陷阱结束！小丑速度恢复正常！");
    }, 500);
  }, 3000);
}


//========================


// 激活速度陷阱
function activateSpeedTrap() {
  if (trapState.isSpeedTrapActive) return;
  
  console.log('激活速度陷阱');
  trapState.isSpeedTrapActive = true;
  
  // 显示通知
  showSimpleNotification("陷阱触发！小丑加速100%！");
  
  // 获取小丑元素
  const jokerElement = document.getElementById("joker-target");
  if (jokerElement) {
    // 添加视觉效果
    jokerElement.classList.add("speed-boosted");
  }
  
  // 如果有移动间隔，加速小丑
  if (window.moveInterval) {
    // 保存当前游戏中计算的间隔
    window.originalMoveSpeed = window.currentMoveSpeed || 500;
    console.log('原始速度:', window.originalMoveSpeed);
    
    // 计算加速后的间隔（减少75%的时间 = 速度提高一倍）
    const boostedSpeed = Math.max(30, Math.floor(window.originalMoveSpeed * 0.25));
    console.log('加速后速度:', boostedSpeed);
    
    clearInterval(window.moveInterval);
    
    // 创建新的加速间隔
    window.moveInterval = setInterval(function() {
      // 直接调用小丑移动函数
      if (typeof window.moveJoker === 'function') {
        window.moveJoker();
      }
    }, boostedSpeed); // 使用计算后的加速间隔
  }
  
  // 3秒后恢复正常
  setTimeout(function() {
    // 恢复小丑外观
    if (jokerElement) {
      jokerElement.classList.remove("speed-boosted");
    }
    
    // 恢复原始移动速度
    if (window.moveInterval) {
      clearInterval(window.moveInterval);
      // 使用保存的原始速度或默认值
      const originalSpeed = window.originalMoveSpeed || 500;
      console.log('恢复到原始速度:', originalSpeed);
      
      window.moveInterval = setInterval(function() {
        if (typeof window.moveJoker === 'function') {
          window.moveJoker();
        }
      }, originalSpeed); // 恢复到原始速度
    }
    
    // 重置陷阱状态
    trapState.isSpeedTrapActive = false;
    isAnyTrapActive = checkIfAnyTrapActive();
    // 显示通知，延迟500毫秒显示，避免与前一个通知重叠
    setTimeout(function() {
      showSimpleNotification("陷阱结束！小丑速度恢复正常！");
    }, 500);
  }, 3000);
}

//========================


// 双击buff陷阱
function activateDoubleHitTrap() {
  if (trapState.isDoubleHitTrapActive) return;
  
  console.log('激活双倍点击陷阱');
  trapState.isDoubleHitTrapActive = true;
  isAnyTrapActive = true;

  showSimpleNotification("小丑奖励！每次点击计为2次！");

  const jokerElement = document.getElementById("joker-target");
  if (jokerElement) {
    jokerElement.classList.add("double-hit-effect");
  }
  // 5秒持续时间
  setTimeout(() => {
    if (jokerElement) {
      jokerElement.classList.remove("double-hit-effect");
    }
    trapState.isDoubleHitTrapActive = false;
    isAnyTrapActive = checkIfAnyTrapActive();
    showSimpleNotification("双倍点击结束！");
  }, 5000);
}


//========================


// 显示简单通知
// 全局变量跟踪当前活动的通知
// 使用队列管理通知，避免重叠
let notificationQueue = [];
let isShowingNotification = false;

function showSimpleNotification(message) {
  console.log('显示通知:', message);
  
  // 将消息加入队列
  notificationQueue.push(message);
  
  // 如果当前没有显示通知，则显示下一个
  if (!isShowingNotification) {
    showNextNotification();
  }
}

function showNextNotification() {
  // 如果队列为空，则返回
  if (notificationQueue.length === 0) {
    isShowingNotification = false;
    return;
  }
  
  isShowingNotification = true;
  
  // 获取队列中的下一个消息
  const message = notificationQueue.shift();
  
  // 创建新的通知元素
  const notification = document.createElement('div');
  notification.className = 'simple-notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // 设置位置，确保不会被其他元素遮挡
  notification.style.zIndex = '1000';
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  notification.style.color = 'white';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '5px';
  notification.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
  notification.style.transition = 'opacity 0.5s';
  
  // 2秒后渐隐并移除
  setTimeout(function() {
    notification.style.opacity = '0';
    setTimeout(function() {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
      // 显示下一个通知
      showNextNotification();
    }, 500);
  }, 2000);
}

// 添加陷阱相关样式
function addTrapStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .speed-boosted {
      filter: brightness(1.5) saturate(2) hue-rotate(300deg) !important;
      transform: scale(1.1) !important;
      animation: speed-pulse 0.3s infinite alternate !important;
      transition: all 0.2s ease !important;
      box-shadow: 0 0 15px 5px rgba(255, 0, 255, 0.7) !important;
    }
    
    @keyframes speed-pulse {
      0% { transform: scale(1.05); }
      100% { transform: scale(1.15); }
    }
    
    .slow-boosted {
      filter: grayscale(0.8) sepia(0.5) hue-rotate(180deg) !important;
      transform: scale(0.9) !important;
      animation: slow-wobble 1s infinite alternate !important;
      transition: all 0.5s ease !important;
      opacity: 0.8 !important;
    }
    
    @keyframes slow-wobble {
      0% { transform: scale(0.9) rotate(-2deg); }
      100% { transform: scale(0.9) rotate(2deg); }
    }

    .double-hit-effect {
      filter: brightness(1.8) hue-rotate(90deg) !important;
      animation: doubleHitGlow 1s infinite alternate !important;
      box-shadow: 0 0 20px 10px rgba(19, 37, 205, 0.5) !important;
    }
    
    @keyframes doubleHitGlow {
      0% { transform: scale(1); }
      100% { transform: scale(1.1); }
    }

    .simple-notification {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(255, 0, 0, 0.8);
      color: white;
      padding: 20px 30px;
      border-radius: 10px;
      font-size: 24px;
      font-weight: bold;
      z-index: 10000;
      text-align: center;
      box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
      opacity: 1;
      transition: opacity 0.5s ease;
    }
  `;
  document.head.appendChild(styleElement);
}

// 强制触发陷阱函数
function forceTriggerTrap() {
  console.log('强制触发陷阱');
  
  // 检查是否有陷阱正在激活
  isAnyTrapActive = checkIfAnyTrapActive();
  if (isAnyTrapActive) {
    console.log('已有陷阱激活，不触发新陷阱');
    showSimpleNotification('上一个陷阱还在生效中！');
    return;
  }
  
  // 使用陷阱概率配置对象来决定触发哪个陷阱
  const randomValue = Math.random();
  let cumulativeProbability = 0;
  
  // 计算总概率，确保概率总和为1
  const totalProbability = Object.values(trapProbabilities).reduce((sum, prob) => sum + prob, 0);
  
  // 根据概率分布选择陷阱
  for (const [trapType, probability] of Object.entries(trapProbabilities)) {
    // 计算标准化后的概率
    const normalizedProbability = probability / totalProbability;
    cumulativeProbability += normalizedProbability;
    
    if (randomValue < cumulativeProbability) {
      // 触发对应的陷阱
      switch (trapType) {
        case 'speedTrap':
          activateSpeedTrap();
          break;
        case 'slowTrap':
          activateSlowTrap();
          break;
        case 'jokerCloneTrap':
          activateJokerCloneTrap();
          break;
        case 'doubleHitTrap': 
          activateDoubleHitTrap();
          break;
      }
      return; // 触发一个陷阱后结束
    }
  }
  
  // 防止概率计算错误，默认触发加速陷阱
  activateSpeedTrap();
}
window.trapState = trapState;
// 导出函数供主游戏使用
window.initTrapSystem = initTrapSystem;
window.forceTriggerTrap = forceTriggerTrap;
window.checkIfAnyTrapActive = checkIfAnyTrapActive;
