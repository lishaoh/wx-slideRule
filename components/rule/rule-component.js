var app = getApp().app;

Component({
    properties: {
        initValue: {
            type: Number,
            value: 0
        },
        maxValue: {
            type: Number,
            value: 400
        },
        minValue: {
            type: Number,
            value: 1
        },
        unitValue: {
            type: Number,
            value: 20
        }
    },
    data: {
        canvasHeight: 55,
        deltaX: 0,
        scrollLeft: 0
    },
    ready: function(options) {
        // 绘制标尺
        this.drawRuler();
        // 绘制三角形游标
        this.drawCursor();
    },
    methods: {
        drawRuler: function() {
            /* 1.定义变量 */
            // 1.1 定义原点与终点，x轴方向起点与终点各留半屏空白
            var origion = { x: app.screenWidth / 2, y: this.data.canvasHeight };
            // 1.2 定义刻度线高度
            var heightDecimal = 25;
            var heightDigit = 15;
            // 1.3 定义文本标签字体大小
            var fontSize = 16;
            // 1.4 最小刻度值
            // 已经定义在全局，便于bindscroll访问
            // 1.5 总刻度值
            var maxValue = this.properties.maxValue;
            // 1.6 当前刻度值
            var currentValue = this.properties.initValue;
            // 1.7 每个刻度所占位的px
            var ratio = this.properties.maxValue / this.properties.unitValue;
            // 1.8 画布宽度
            var canvasWidth = maxValue * ratio + app.screenWidth - this.properties.minValue * ratio;
            // 设定scroll-view初始偏移
            this.setData({
                canvasWidth: canvasWidth,
                scrollLeft: (currentValue - this.properties.minValue) * ratio
            });

            /* 2.绘制 */

            // 2.1初始化context
            const context = wx.createCanvasContext('canvas-ruler', this);
            // 遍历maxValue
            for (var i = this.properties.minValue; i <= maxValue; i++) {
                context.beginPath();
                // 2.2 画刻度线
                context.moveTo(origion.x + (i - this.properties.minValue) * ratio, origion.y);
                // 画线到刻度高度，10的位数就加高
                context.lineTo(origion.x + (i - this.properties.minValue) * ratio, origion.y - (i % ratio == 0 ? heightDecimal : heightDigit));
                // 设置属性
                context.setLineWidth(2);
                // 10的位数就加深
                context.setStrokeStyle(i % ratio == 0 ? 'gray' : 'darkgray');
                // 描线
                context.stroke();
                // 2.3 描绘文本标签
                context.setFillStyle('gray');
                if (i % ratio == 0) {
                    context.setFontSize(fontSize);
                    // 为零补一个空格，让它看起来2位数，页面更整齐
                    context.fillText(i == this.properties.minValue ? ' ' + i : i, origion.x + (i - this.properties.minValue) * ratio - fontSize / 2 - 1, fontSize);
                }
                context.closePath();
            }
            // 2.4 绘制到context
            context.draw();
        },
        drawCursor: function() {
            /* 定义变量 */
            // 定义三角形顶点 TODO x
            var center = { x: app.screenWidth / 2, y: 5 };
            // 定义三角形边长
            var length = 10;
            // 左端点
            var left = { x: center.x - length / 2, y: center.y + length / 2 * Math.sqrt(3) };
            // 右端点
            var right = { x: center.x + length / 2, y: center.y + length / 2 * Math.sqrt(3) };
            // 初始化context
            const context = wx.createCanvasContext('canvas-cursor', this);
            context.moveTo(center.x, center.y);
            context.lineTo(left.x, left.y);
            context.lineTo(right.x, right.y);
            // fill()填充而不是stroke()描边，于是省去手动回归原点，context.lineTo(center.x, center.y);
            context.setFillStyle('#ec8aac');
            context.fill();
            context.draw();
        },
        bindscroll: function(e) {
            // deltaX 水平位置偏移位，每次滑动一次触发一次，所以需要记录从第一次触发滑动起，一共滑动了多少距离
            this.data.deltaX += e.detail.deltaX;
            var scrollValue = (-this.data.deltaX / 10 + this.properties.minValue).toFixed(1)
            if (scrollValue < 0.01) {
                scrollValue = this.properties.minValue;
            } else if (scrollValue >= this.properties.maxValue) {
                scrollValue = this.properties.maxValue;
            }

            this.triggerEvent('scroll', { scrollValue }, { composed: true });
        }
    }
})