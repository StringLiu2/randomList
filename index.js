// 复制 87.63±5.38 直接扔进来即可
const pAndCArr = [
  "-49.63±10.68",
  "-44.87±10.92",
  "-50.21±12.17",
  "70.26±15.20",
  "75.56±16.12",
  "71.59±14.73",
  "77.24±15.16",
  "70.97±15.08",
  "79.36±14.34",
  "0.44±0.08",
  "0.49±0.10",
  "0.46±0.09",
  "0.52±0.07",
  "0.45±0.08",
  "0.55±0.09",
];
// 0就是拿第一项 87.63 / 5.38 1就是拿第二项 75.87 / 6.01
const pIndex = 1;

const currentLength = 30; // 多少项值 （如果有30项就填30）

// 拿到平均值、相对偏差
const [p, c] = pAndCArr[pIndex]
  .split("±")
  .map((item) => Number.parseFloat(item));

const FIXED_NUM = 3; // 小数点后多少位 3就是 0.001、2就是0.01、0就是0位小数

const cAndCurrentC = 0.0005; // 相对偏差偏差值 例如 5.38 就是偏差 5.3804 - 5.3796 之间

const pAdnCurrentP = 0.1; // 平均值偏差 87.63  就是 87.631 - 87.629 之间

const minPValue = p - c * 1.3; // 与平均值的距离 87.63 - 5.38 * 1.8 = 77.946，不能小于 77.946
const maxPValue = p + c * 1.3; // 与平均值的距离 87.63 + 5.38 * 2 = 98.39，不能大于 98.39

const randomScale = +(c / 50).toFixed(FIXED_NUM + 1); // 每次加的值，0到0.15、可以调整这个值（为相对偏差的1/100）

console.log(
  "开始 ---> 平均值:",
  p,
  "，相对偏差:",
  c,
  ", treatment =",
  pAndCArr[pIndex]
);

console.log("平均值偏差:", minPValue, " - ", maxPValue);
let randomValue = 0;
function getRandom(i = 0) {
  if (i % FIXED_NUM === 0 || randomValue) {
    randomValue = Math.random() * randomScale;
  }
  return +randomValue.toFixed(FIXED_NUM);
}
function calcArr(p, c, length) {
  let arr = Array.from({ length }).map(() => p);
  let curP = p;

  let curC = +calcC(arr, p).toFixed(FIXED_NUM + 1);
  while (Math.abs(curC - c) > cAndCurrentC && curC - c < 0.1) {
    for (let index = 0; index < length; index++) {
      const val = arr[index];
      const random = getRandom(index);
      const isAdd = Math.random() > 0.5;
      // 随机索引 取整数
      let randomIndex = (Math.random() * (length - 1)).toFixed(0);

      // 补充加的情况（加多少减多少）
      arr[randomIndex] = +(
        arr[randomIndex] + (isAdd ? -random : random)
      ).toFixed(FIXED_NUM);

      arr[index] = +(val + (isAdd ? random : -random)).toFixed(FIXED_NUM);
    }
    curP = +calcP(arr).toFixed(FIXED_NUM + 1);
    curC = +calcC(arr, curP).toFixed(FIXED_NUM + 1);
  }
  // 出现超标，直接重新计算
  if (Math.abs(curP - p) > pAdnCurrentP || Math.abs(curC - c) > cAndCurrentC) {
    // 重新循环 计算
    calcArr(p, c, length);
    return;
  }
  const isNoValue = arr.find((item) => item < minPValue || item > maxPValue);
  // 偏差过大
  if (isNoValue) {
    console.log(`当前值: ${isNoValue} 与平均值 ----> 偏差太大`);
    // 重新循环 计算
    calcArr(p, c, length);
    return;
  }
  arr.forEach((val) => console.log(val));
  console.log("计算后的平均值: ", curP, "最后计算出来的相对偏差: ", curC);
}
calcArr(p, c, currentLength);

// 求绝对偏差
function calcP(arr = []) {
  return arr.reduce((item, v) => item + v, 0) / arr.length;
}
// 求相对偏差
function calcC(arr = [], curP = 0) {
  const newC =
    arr.reduce((item, v) => item + Math.pow(v - curP, 2), 0) / (arr.length - 1);
  return Math.sqrt(newC);
}
