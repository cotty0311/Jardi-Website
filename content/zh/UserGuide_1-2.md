# 虛擬移動

虛擬移動是由一系列虛擬定位點構成，讓手機可持續的虛擬移動，包含「自動位移🚶‍♀️」、「沿線移動🧭」，都是虛擬移動的功能。

## 自動位移 🚶‍♀️

自動位移會以工具目前紀錄的位置為起點，走方形螺旋路徑。啟動時取得的 Mac 位置可作為初始位置；操作後則以工具紀錄的 iPhone 模擬位置為準。

輸入 `1` km, 表示會繞行半徑 1 km 的方形，也就是 2km x 2km 的方形，直到完全繞完停止。

<figure class="media-card">
  <figcaption><strong>方形螺旋如何移動？</strong><span>調整 speed，或使用開始、暫停與停止，觀察由中心向外展開的路徑。</span></figcaption>
  <iframe class="demo-frame" src="../_Animation/square-spiral/index.html" title="方形螺旋移動互動示範" loading="lazy" sandbox="allow-scripts"></iframe>
  <p class="media-note">這是縮放後的動畫示意，不會連接 iPhone，也不代表實際移動距離或所需時間。</p>
</figure>

## 沿線移動 🧭

1. 開啟 **advanced**。
2. 選擇沿線來源：可選「文件」，或直接「貼上座標」。
    * 確認至少有 **2 個有效座標**；貼上的座標可一行一組。
3. 設定速度與沿線選項，按「確認」。
4. 回到主畫面，按「🧭」開始沿線移動。

```text
25.033968, 121.564468
25.034568, 121.565068
25.035168, 121.564468
```

>  注意，正在使用「自動位移🚶‍♀️」、「沿線移動🧭」時，須先「停止」，方可開啟 advanced

## 進階設定

| 選項 | 操作效果 |
| --- | --- |
| 速度 speed | 1–20 km/hr，影響自動位移🚶‍♀️、沿線移動🧭、飛經緯度的腳踏車🚴 |
| 快速 fast | 逐點跳轉，每點停留 **20 秒** |
| 開始 index | 指定開始的座標編號，從 1 開始；random 可挑選隨機起點 |
| 反向 reverse | 反向遍歷座標序列 |
| 循環 repeat | 完成後繼續循環；想結束時手動停止 |
| 環繞 Orbit 🪐 | 在每個目標座標周圍走一段覆蓋路徑，再前往下一個目標 |

> 注意，有時無法沿線是因為 start index 設定超出範圍，會無法進行沿線移動🧭

<figure class="media-card">
  <figcaption><strong>試試不同的 advanced 參數設定</strong><span>切換 fast、reverse、repeat 與 Orbit，比較移動順序與方式。</span></figcaption>
  <iframe class="demo-frame" src="../_Animation/advanced-demo/index.html" title="Advanced 沿線設定互動示範" loading="lazy" sandbox="allow-scripts"></iframe>
  <p class="media-note">示範將 fast 等待縮短至約 1 秒，Orbit 使用圓形動畫方便理解；App 的停留時間與覆蓋路徑請以本頁說明為準。</p>
</figure>
