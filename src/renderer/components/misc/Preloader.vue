<template>
    <div class="fullsize flex-center">
        <Progress :percent="loadedPercent" :height="40" style="width: 70%" />
    </div>
</template>

<script lang="ts" setup>
import { randomFromArray } from "jaz-ts-utils";
import * as path from "path";
import { computed, onMounted, ref } from "vue";

import Progress from "@/components/common/Progress.vue";

const emit = defineEmits(["complete"]);

const totalFiles = ref(0);
const loadedFiles = ref(0);
const loadedPercent = computed(() => loadedFiles.value / totalFiles.value);

const imageFiles = import.meta.glob("@/assets/images/**/*", { as: "url" });
const fontFiles = import.meta.glob("@/assets/fonts/*", { as: "url" });

// totalFiles.value = imageFiles.length + fontFiles.length;

onMounted(async () => {
    const randomImageFileKey = randomFromArray(Object.keys(imageFiles).filter((key) => key.includes("backgrounds")))!;
    const randomImageFile = await imageFiles[randomImageFileKey]();
    document.documentElement.style.setProperty("--background", `url(${randomImageFile})`);

    const loadedImages: string[] = [];

    for (const imageFile in imageFiles) {
        const resolvedUrl = await imageFiles[imageFile]();
        const image = await loadImage(resolvedUrl);
        loadedImages.push(image);
        loadedFiles.value++;
    }

    for (const fontFile in fontFiles) {
        const resolvedUrl = await fontFiles[fontFile]();
        await loadFont(resolvedUrl);
        loadedFiles.value++;
    }

    api.audio.load();

    emit("complete");
});

async function loadFont(url: string) {
    const fileName = path.parse(url).name.split(".")[0];
    const [family, weight, style] = fileName.split("-");
    const font = new FontFace(family, `url(${url})`, { weight, style });
    document.fonts.add(font);
    return font.load();
}

function loadImage(url: string) {
    return new Promise<string>((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            resolve(url);
        };
        image.onerror = () => {
            reject(`Failed to load image ${url}`);
        };
        image.src = url;
    });
}
</script>

<style lang="scss" scoped></style>
