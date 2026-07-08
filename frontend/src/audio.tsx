const audioCtx = new (window.AudioContext)();

let muted = localStorage.getItem("muted") === "true";

let foundBuffer: AudioBuffer;
let newBuffer: AudioBuffer;
let putBuffer: AudioBuffer;
let pickBuffer: AudioBuffer;
let dropBuffer: AudioBuffer;

export function isMuted(): boolean {
    return muted;
}

export function toggleMute(): boolean {
    muted = !muted;
    localStorage.setItem("muted", String(muted));
    return muted;
}

async function loadSound(url: string): Promise<AudioBuffer> {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    return await audioCtx.decodeAudioData(arrayBuffer);
}

[
    foundBuffer,
    newBuffer,
    putBuffer,
    pickBuffer,
    dropBuffer,
] = await Promise.all([
    loadSound("/assets/sounds/found.mp3"),
    loadSound("/assets/sounds/new.mp3"),
    loadSound("/assets/sounds/put.mp3"),
    loadSound("/assets/sounds/pick.mp3"),
    loadSound("/assets/sounds/drop.mp3"),
]);

export function playBuffer(
    buffer: AudioBuffer,
    playbackRate: number = 1
): void {
    if (muted) return;

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;

    source.connect(audioCtx.destination);
    source.start();
}

export {
    foundBuffer,
    newBuffer,
    putBuffer,
    pickBuffer,
    dropBuffer,
};