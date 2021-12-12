const treatment = document.querySelector(".treatment"); // treatment格式输入框

const arrLength = document.querySelector(".arr-length"); // 数组长度

// 点击的按钮
const btn = document.querySelector("button");
const closeBtn = document.querySelector("button.close");
// 错误信息框
const consoleText = document.querySelector(".console-text");

// 结果框
const successText = document.querySelector(".success-text");

// 精确值处理节点
const fixedNumEle = document.querySelector(".fixed-num");
// 单次变化最大值处理
const randomMaxValueEle = document.querySelector(".random-max-value");
// 偏差值（相对偏差、平均值）
const deviationCEle = document.querySelector(".deviation-c");
const deviationPEle = document.querySelector(".deviation-p");

// 平均值最小值差、最大差
const minPValueEle = document.querySelector(".min-p-value");
const maxPValueEle = document.querySelector(".max-p-value");

arrLength.value = 30;

let isStart = false; // 是否在执行中

btn.onclick = function () {
  if (isStart) return;

  if (!treatment.value) {
    window.alert("请输入 treatment格式");
    return;
  }
  close(); // 先清空一下

  isStart = true;
  btn.setAttribute("disabled", true);
  btn.textContent = "正在执行中、请稍等...";
  // 执行各种操作
  const length = +arrLength.value;
  const [p, c] = treatment.value
    .split("±")
    .map((item) => Number.parseFloat(item));

  const FIXED_NUM = +fixedNumEle.value || 3; // 小数点后多少位 3就是 0.001、2就是0.01、0就是0位小数

  const cAndCurrentC = +deviationCEle.value || 0.0004; // 相对偏差偏差值 例如 5.38 就是偏差 5.3804 - 5.3796 之间

  const pAndCurrentP = +deviationPEle.value || 0.001; // 平均值偏差 87.63  就是 87.631 - 87.629 之间

  const minPValue = +(p - c * (+minPValueEle.value || 1.8)).toFixed(FIXED_NUM); // 与平均值的距离 87.63 - 5.38 * 1.8 = 77.946，不能小于 77.946
  const maxPValue = +(p + c * (+maxPValueEle.value || 2)).toFixed(FIXED_NUM); // 与平均值的距离 87.63 + 5.38 * 2 = 98.39，不能大于 98.39

  const randomScale = c / +(randomMaxValueEle.value || 100); // 每次加的值，0到0.15、可以调整这个值
  consoleText.value += `开始 ---> 平均值: ${p}，相对偏差: ${c} \ntreatment: ${treatment.value}`;
  consoleText.value += `\n生成数据项：${length}个，小数点后${FIXED_NUM}位`;
  consoleText.value += `\n单次变化最大值：${randomScale}`;
  consoleText.value += `\n平均值偏差：${pAndCurrentP}，相对值偏差：${cAndCurrentC}`;
  consoleText.value += `\n平均值最小值差：${minPValue}\n平均值最大值差：${maxPValue}`;

  requestAnimationFrame(() => {
    calcArr(p, c, length);
  });

  function calcArr(p, c, length) {
    // 不执行
    if (!isStart) return;
    let arr = Array.from({ length }).map(() => p);
    let curP = p;

    let curC = +calcC(arr, p).toFixed(FIXED_NUM + 1);
    while (Math.abs(curC - c) > cAndCurrentC && curC - c < 0.1) {
      for (let index = 0; index < length; index++) {
        const val = arr[index];
        const random = +(Math.random() * randomScale).toFixed(FIXED_NUM);
        const isAdd = Math.random() > 0.5;
        // 随机索引 取整数
        const randomIndex = (Math.random() * (length - 1)).toFixed(0);
        // 补充加的情况（加多少减多少）
        arr[randomIndex] = +(
          arr[randomIndex] + (isAdd ? -random : random)
        ).toFixed(FIXED_NUM);

        arr[index] = +(val + (isAdd ? random : -random)).toFixed(FIXED_NUM);
      }

      curP = +calcP(arr).toFixed(FIXED_NUM + 1);
      curC = +calcC(arr, curP).toFixed(FIXED_NUM + 1);
    }
    if (
      Math.abs(curP - p) > pAndCurrentP ||
      Math.abs(curC - c) > cAndCurrentC
    ) {
      // 重新循环 计算
      requestAnimationFrame(() => {
        calcArr(p, c, length);
      });
      return;
    }
    // 验证是否有超出的值
    const item = arr.find((item) => item < minPValue || item > maxPValue);
    // 偏差过大
    if (item) {
      consoleText.value += `\n当前值: ${item} 与平均值${curP} ----> 偏差太大`;
      // 重新循环 计算
      requestAnimationFrame(() => {
        calcArr(p, c, length);
      });
      return;
    }
    arr.forEach(
      (val, i) => (successText.value += `${i === 0 ? "" : "\n"}${val}`)
    );
    const text = `最终平均值: ${curP}, 最终相对偏差: ${curC}`;
    consoleText.value += `\n${text}`;
    window.alert(text);
    setDefaultState();
  }

  // 求绝对偏差
  function calcP(arr = []) {
    return arr.reduce((item, v) => item + v, 0) / arr.length;
  }
  // 求相对偏差
  function calcC(arr = [], curP = 0) {
    const newC =
      arr.reduce((item, v) => item + Math.pow(v - curP, 2), 0) /
      (arr.length - 1);
    return Math.sqrt(newC);
  }
};
function setDefaultState() {
  isStart = false;
  btn.removeAttribute("disabled");
  btn.textContent = "开始执行";
}
function close() {
  setDefaultState();
  consoleText.value = "";
  successText.value = "";
}
closeBtn.onclick = close;
