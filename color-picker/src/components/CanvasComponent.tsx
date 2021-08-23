import { Component } from "react";
import React from 'react';
import "../style/CanvasComponent.css";

const colorShemes = {
    ANALOGOUS: 'analogous',
    MONOCHROMATIC: 'monochromatic',
    TRIAD: 'triad',
    SQUARE: 'square',
    COMPLEMENTARY: 'complementary',
    SPLIT_COMPLEMENTARY: 'splitComplementary',
}

const black = 'black'

interface Props {
}

interface State {
    currentColorPalette: string
    mouseDown: boolean
    colorsArray: object[]
}

class CanvasComponent extends Component<Props, State>{

    constructor(props: Props) {
        super(props);
        this.state = {
            currentColorPalette: null,
            mouseDown: false,
            colorsArray: []
        }
    }

    drawCircle = (ctx) => {

        const radius = 75;
        let image = ctx.createImageData(2 * radius, 2 * radius);
        let data = image.data;

        for (let x = -radius; x < radius; x++) {
            for (let y = -radius; y < radius; y++) {

                let [r, phi] = this.xy2polar(x, y);

                if (r > radius) {
                    // skip all (x,y) coordinates that are outside of the circle
                    continue;
                }

                let deg = this.rad2deg(phi);

                // Figure out the starting index of this pixel in the image data array.
                let rowLength = 2 * radius;
                let adjustedX = x + radius; // convert x from [-75, 75] to [0, 150] (the coordinates of the image data array)
                let adjustedY = y + radius; // convert y from [-75, 75] to [0, 150] (the coordinates of the image data array)
                let pixelWidth = 4; // each pixel requires 4 slots in the data array
                let index = (adjustedX + adjustedY * rowLength) * pixelWidth;

                let hue = deg;
                let saturation = r / radius;
                let value = 1.0;

                let [red, green, blue] = this.hsv2rgb(hue, saturation, value);
                let alpha = 255;

                data[index] = red;
                data[index + 1] = green;
                data[index + 2] = blue;
                data[index + 3] = alpha;
            }
        }

        ctx.putImageData(image, 0, 0);

    }


    xy2polar = (x, y) => {
        let r = Math.sqrt(x * x + y * y);
        let phi = Math.atan2(y, x);
        return [r, phi];
    }

    // rad in [-π, π] range
    // return degree in [0, 360] range
    rad2deg = (rad) => {
        return (rad + Math.PI) / (2 * Math.PI) * 360;
    }

    // hue in range [0, 360]
    // saturation, value in range [0,1]
    // return [r,g,b] each in range [0,255]
    // See: https://en.wikipedia.org/wiki/HSL_and_HSV#From_HSV
    hsv2rgb = (hue, saturation, value) => {
        let chroma = value * saturation;
        let hue1 = hue / 60;
        let x = chroma * (1 - Math.abs(hue1 % 2 - 1));
        let r1, g1, b1;
        if (hue1 >= 0 && hue1 <= 1) {
            [r1, g1, b1] = [chroma, x, 0];
        } else if (hue1 >= 1 && hue1 <= 2) {
            [r1, g1, b1] = [x, chroma, 0];
        } else if (hue1 >= 2 && hue1 <= 3) {
            [r1, g1, b1] = [0, chroma, x];
        } else if (hue1 >= 3 && hue1 <= 4) {
            [r1, g1, b1] = [0, x, chroma];
        } else if (hue1 >= 4 && hue1 <= 5) {
            [r1, g1, b1] = [x, 0, chroma];
        } else if (hue1 >= 5 && hue1 <= 6) {
            [r1, g1, b1] = [chroma, 0, x];
        }

        let m = value - chroma;
        let [r, g, b] = [r1 + m, g1 + m, b1 + m];

        // Change r,g,b values from [0,1] to [0,255]
        return [255 * r, 255 * g, 255 * b];
    }

    handleColorClick = (event: any): void => {
        this.changeColorPalette(event.clientX, event.clientY);
    }

    handleMouseMove = (event: any): void => {
        if (this.isMouseDown()) {
            this.changeColorPalette(event.clientX, event.clientY);
        }

    }

    isMouseDown = (): boolean => {
        return this.state.mouseDown
    }

    changeColorPalette = (clientX, clientY) => {
        const canvas = (document.getElementById("canvas") as HTMLCanvasElement);
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        const canvas2 = (document.getElementById("color") as HTMLCanvasElement);
        const ctx2 = canvas2.getContext('2d');

        this.clearCanvas(canvas)
        this.clearCanvas(canvas2)
        this.drawCircle(ctx)

        switch (this.state.currentColorPalette) {
            case colorShemes.ANALOGOUS: {
                this.getAnalogousColorPalette(ctx, ctx2, rect, clientX, clientY)
                return
            }
            case colorShemes.MONOCHROMATIC: {
                this.getMonochromaticColorPalette(ctx, ctx2, rect, clientX, clientY)
                return
            }
            case colorShemes.TRIAD: {
                this.getTriadColorPalette(ctx, ctx2, rect, clientX, clientY)
                return
            }
            case colorShemes.SQUARE: {
                this.getSquareColorPalette(ctx, ctx2, rect, clientX, clientY)
                return
            }
            case colorShemes.COMPLEMENTARY: {
                this.getComplementaryColorPalette(ctx, ctx2, rect, clientX, clientY)
                return
            }
            case colorShemes.SPLIT_COMPLEMENTARY: {
                this.getSplitComplementaryColorPalette(ctx, ctx2, rect, clientX, clientY)
                return
            }
            default: {
                this.getMonochromaticColorPalette(ctx, ctx2, rect, clientX, clientY)
                return
            }
        }
    }

    getMonochromaticColorPalette = (ctx, ctx2, rect, clientX, clientY) => {
        //Get canvas cooridnates
        const x = clientX - rect.left
        const y = clientY - rect.top

        const baseX = 65;
        const baseY = 100;
        const r = 30;
        const offset = r + 10;

        const point = ctx.getImageData(x, y, 1, 1);

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = black;
        ctx.stroke();

        let colorsArrayTmp = []

        for (let i = 1; i < 5; i++) {
            const delta = i
            let red = (point.data[0] / delta).toString()
            let green = (point.data[1] / delta).toString()
            let blue = (point.data[2] / delta).toString()
            let alpha = (point.data[3] / delta).toString()
            const changedColor = `rgba(${parseInt(red)},${parseInt(green)},${parseInt(blue)},${parseInt(alpha)})`
            ctx2.beginPath();
            ctx2.arc(baseX + (delta - 1) * offset, baseY, r, 0, 2 * Math.PI, false);
            ctx2.fillStyle = changedColor;
            ctx2.fill();

            colorsArrayTmp.push({
                rgb: changedColor,
                hex: this.rgba2hex(changedColor)
            })
        }

        this.setState({
            colorsArray: colorsArrayTmp
        })

    }

    getComplementaryColorPalette = (ctx, ctx2, rect, clientX, clientY) => {
        //Get canvas cooridnates
        const radius = 75;
        const x = clientX - rect.left - radius
        const y = clientY - rect.top - radius

        const baseX = 65;
        const baseY = 100;
        const r = 30;
        const offset = r + 10;

        const pointRadius = Math.sqrt(x * x + y * y)
        const pointStartAlpha = Math.atan(y / x)

        let colorsArrayTmp = []

        ctx.save()
        ctx.translate(radius, radius)

        let alpha = pointStartAlpha;
        for (let i = 0; i < 2; i++) {
            let newX = pointRadius * Math.cos(alpha)
            let newY = pointRadius * Math.sin(alpha)
            alpha += 180 * Math.PI / 180

            let newPoint = ctx.getImageData(newX + radius, newY + radius, 1, 1);
            let changedColor = `rgba(${parseInt(newPoint.data[0])},${parseInt(newPoint.data[1])},${parseInt(newPoint.data[2])},${parseInt(newPoint.data[3])})`

            ctx2.beginPath();
            ctx2.arc(baseX + i * offset, baseY, r, 0, 2 * Math.PI, false);
            ctx2.fillStyle = changedColor;
            ctx2.fill();

            ctx.beginPath();
            ctx.arc(newX, newY, 2, 0, 2 * Math.PI);
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = black;
            ctx.stroke();

            colorsArrayTmp.push({
                rgb: changedColor,
                hex: this.rgba2hex(changedColor)
            })
        }

        ctx.restore()

        this.setState({
            colorsArray: colorsArrayTmp
        })
    }

    getSplitComplementaryColorPalette = (ctx, ctx2, rect, clientX, clientY) => {
        //Get canvas cooridnates
        const radius = 75;
        const x = clientX - rect.left - radius
        const y = clientY - rect.top - radius

        const baseX = 65;
        const baseY = 100;
        const r = 30;
        const offset = r + 10;

        const pointRadius = Math.sqrt(x * x + y * y)
        const pointStartAlpha = Math.atan(y / x)

        let colorsArrayTmp = []

        ctx.save()
        ctx.translate(radius, radius)

        let alpha = pointStartAlpha;
        for (let i = 0; i < 3; i++) {
            let newX = pointRadius * Math.cos(alpha)
            let newY = pointRadius * Math.sin(alpha)

            if (i === 0) {
                alpha = pointStartAlpha + 150 * Math.PI / 180
            }
            else if (i === 1) {
                alpha = pointStartAlpha + 210 * Math.PI / 180
            }


            let newPoint = ctx.getImageData(newX + radius, newY + radius, 1, 1);
            let changedColor = `rgba(${parseInt(newPoint.data[0])},${parseInt(newPoint.data[1])},${parseInt(newPoint.data[2])},${parseInt(newPoint.data[3])})`

            ctx2.beginPath();
            ctx2.arc(baseX + i * offset, baseY, r, 0, 2 * Math.PI, false);
            ctx2.fillStyle = changedColor;
            ctx2.fill();

            ctx.beginPath();
            ctx.arc(newX, newY, 2, 0, 2 * Math.PI);
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = black;
            ctx.stroke();

            colorsArrayTmp.push({
                rgb: changedColor,
                hex: this.rgba2hex(changedColor)
            })
        }

        ctx.restore()

        this.setState({
            colorsArray: colorsArrayTmp
        })
    }

    getAnalogousColorPalette = (ctx, ctx2, rect, clientX, clientY) => {
        //Get canvas cooridnates
        const radius = 75;
        const x = clientX - rect.left - radius
        const y = clientY - rect.top - radius

        const baseX = 65;
        const baseY = 100;
        const r = 30;
        const offset = r + 10;

        const pointRadius = Math.sqrt(x * x + y * y)
        const pointStartAlpha = Math.atan(y / x)

        let colorsArrayTmp = []

        ctx.save()
        ctx.translate(radius, radius)

        let alpha = pointStartAlpha;
        for (let i = 0; i < 3; i++) {
            let newX = pointRadius * Math.cos(alpha)
            let newY = pointRadius * Math.sin(alpha)
            alpha += 30 * Math.PI / 180


            let newPoint = ctx.getImageData(newX + radius, newY + radius, 1, 1);
            let changedColor = `rgba(${parseInt(newPoint.data[0])},${parseInt(newPoint.data[1])},${parseInt(newPoint.data[2])},${parseInt(newPoint.data[3])})`

            ctx2.beginPath();
            ctx2.arc(baseX + i * offset, baseY, r, 0, 2 * Math.PI, false);
            ctx2.fillStyle = changedColor;
            ctx2.fill();

            ctx.beginPath();
            ctx.arc(newX, newY, 2, 0, 2 * Math.PI);
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = black;
            ctx.stroke();

            colorsArrayTmp.push({
                rgb: changedColor,
                hex: this.rgba2hex(changedColor)
            })
        }

        ctx.restore()

        this.setState({
            colorsArray: colorsArrayTmp
        })
    }

    getTriadColorPalette = (ctx, ctx2, rect, clientX, clientY) => {
        //Get canvas cooridnates
        const radius = 75;
        const x = clientX - rect.left - radius
        const y = clientY - rect.top - radius

        const baseX = 65;
        const baseY = 100;
        const r = 30;
        const offset = r + 10;

        const pointRadius = Math.sqrt(x * x + y * y)
        const pointStartAlpha = Math.atan(y / x)

        let colorsArrayTmp = []

        ctx.save()
        ctx.translate(radius, radius)

        let alpha = pointStartAlpha;
        for (let i = 0; i < 3; i++) {
            let newX = pointRadius * Math.cos(alpha)
            let newY = pointRadius * Math.sin(alpha)
            alpha += 120 * Math.PI / 180


            let newPoint = ctx.getImageData(newX + radius, newY + radius, 1, 1);
            let changedColor = `rgba(${parseInt(newPoint.data[0])},${parseInt(newPoint.data[1])},${parseInt(newPoint.data[2])},${parseInt(newPoint.data[3])})`

            ctx2.beginPath();
            ctx2.arc(baseX + i * offset, baseY, r, 0, 2 * Math.PI, false);
            ctx2.fillStyle = changedColor;
            ctx2.fill();

            ctx.beginPath();
            ctx.arc(newX, newY, 2, 0, 2 * Math.PI);
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = black;
            ctx.stroke();

            colorsArrayTmp.push({
                rgb: changedColor,
                hex: this.rgba2hex(changedColor)
            })
        }

        ctx.restore()

        this.setState({
            colorsArray: colorsArrayTmp
        })
    }

    getSquareColorPalette = (ctx, ctx2, rect, clientX, clientY) => {
        //Get canvas cooridnates
        const radius = 75;
        const x = clientX - rect.left - radius
        const y = clientY - rect.top - radius

        const baseX = 65;
        const baseY = 100;
        const r = 30;
        const offset = r + 10;

        const pointRadius = Math.sqrt(x * x + y * y)
        const pointStartAlpha = Math.atan(y / x)

        let colorsArrayTmp = []

        ctx.save()
        ctx.translate(radius, radius)

        let alpha = pointStartAlpha;
        for (let i = 0; i < 4; i++) {
            let newX = pointRadius * Math.cos(alpha)
            let newY = pointRadius * Math.sin(alpha)
            alpha += 90 * Math.PI / 180

            let newPoint = ctx.getImageData(newX + radius, newY + radius, 1, 1);
            let changedColor = `rgba(${parseInt(newPoint.data[0])},${parseInt(newPoint.data[1])},${parseInt(newPoint.data[2])},${parseInt(newPoint.data[3])})`

            ctx2.beginPath();
            ctx2.arc(baseX + i * offset, baseY, r, 0, 2 * Math.PI, false);
            ctx2.fillStyle = changedColor;
            ctx2.fill();

            ctx.beginPath();
            ctx.arc(newX, newY, 2, 0, 2 * Math.PI);
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = black;
            ctx.stroke();

            colorsArrayTmp.push({
                rgb: changedColor,
                hex: this.rgba2hex(changedColor)
            })
        }

        ctx.restore()

        this.setState({
            colorsArray: colorsArrayTmp
        })
    }

    rgba2hex = (rgba) => {
        rgba = rgba.match(
            /^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i
        );
        return rgba && rgba.length === 4
            ? "#" +
            ("0" + parseInt(rgba[1], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgba[2], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgba[3], 10).toString(16)).slice(-2)
            : "";
    }

    clearCanvas = (canvas: HTMLCanvasElement): void => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    handleColorPaletteChange = (event: any): void => {
        this.setState({
            currentColorPalette: event.target.value
        })
    }

    handleMouseDownEvent = (): void => {
        this.setState({ mouseDown: true });
    }

    handleMouseUpEvent = (): void => {
        this.setState({ mouseDown: false });
    }

    handleInputChange = (event: any) => {

    }

    componentDidMount = () => {
        const ctx = (document.getElementById("canvas") as HTMLCanvasElement).getContext('2d');
        this.drawCircle(ctx);
    }

    render() {
        return (
            <div className="out">
                <div className="main">
                    <canvas onMouseDown={this.handleMouseDownEvent} onMouseUp={this.handleMouseUpEvent} onClick={this.handleColorClick} onMouseMove={this.handleMouseMove} id="canvas"></canvas>

                    <div className="colorPaletts">
                        <div className="colorPalette">
                            <input onChange={this.handleColorPaletteChange} type="radio" id="analogous" name="colorPalettes" value={colorShemes.ANALOGOUS} />
                            <label htmlFor="analogous">Analogous</label>
                        </div>

                        <div className="colorPalette">
                            <input onChange={this.handleColorPaletteChange} type="radio" id="monochromatic" name="colorPalettes" value={colorShemes.MONOCHROMATIC} />
                            <label htmlFor="monochromatic">Monochromatic</label>
                        </div>

                        <div className="colorPalette">
                            <input onChange={this.handleColorPaletteChange} type="radio" id="triad" name="colorPalettes" value={colorShemes.TRIAD} />
                            <label htmlFor="triad">Triad</label>
                        </div>

                        <div className="colorPalette">
                            <input onChange={this.handleColorPaletteChange} type="radio" id="square" name="colorPalettes" value={colorShemes.SQUARE} />
                            <label htmlFor="square">Square</label>
                        </div>

                        <div className="colorPalette">
                            <input onChange={this.handleColorPaletteChange} type="radio" id="complementary" name="colorPalettes" value={colorShemes.COMPLEMENTARY} />
                            <label htmlFor="complementary">Complementary</label>
                        </div>

                        <div className="colorPalette">
                            <input onChange={this.handleColorPaletteChange} type="radio" id="splitComplementary" name="colorPalettes" value={colorShemes.SPLIT_COMPLEMENTARY} />
                            <label htmlFor="splitComplementary">Split Complementary</label>
                        </div>
                    </div>
                </div>
                <div className="inputs">
                    <canvas id="color"></canvas>
                    {this.state.colorsArray.map((obj, index) => (
                        <div key={index}>
                            <div className="input">
                                <input id="hex" type="text" value={obj["hex"]} onChange={this.handleInputChange}></input>
                                <label>HEX:</label>
                            </div>
                            <div className="input">
                                <input id="rgba" type="text" value={obj["rgb"]} onChange={this.handleInputChange}></input>
                                <label>RGBA:</label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
}

export default CanvasComponent;