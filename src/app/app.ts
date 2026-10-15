import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, signal } from '@angular/core';
import Hls from 'hls.js';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <main class="fixed inset-0 h-dvh w-screen overflow-hidden bg-black">
      <!-- Full-screen video -->
      <video
        #videoPlayer
        class="absolute inset-0 h-full w-full bg-black object-contain"
        controls
        autoplay
        playsinline
        preload="auto"
      ></video>

      <!-- Loading / error message -->
      @if (message()) {
        <div
          class="absolute left-1/2 top-6 z-10
                 -translate-x-1/2 rounded-xl
                 bg-gray-900/90 px-5 py-3
                 text-center text-sm text-white shadow-lg"
        >
          {{ message() }}
        </div>
      }

      <!-- Full-screen button -->
      <button
        type="button"
        (click)="toggleFullscreen()"
        class="absolute right-4 top-4 z-20
               rounded-lg bg-black/60 px-4 py-2
               text-sm font-semibold text-white
               ring-1 ring-white/20 transition
               hover:bg-white/20"
      >
        ⛶ Full screen
      </button>
    </main>
  `,
})
export class App implements AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer')
  videoRef!: ElementRef<HTMLVideoElement>;

  protected readonly title = signal('iptv');
  protected readonly message = signal('Loading stream...');

  private hls?: Hls;

  private readonly streamUrl =
    'https://da86m1sqpm3o0.cloudfront.net/28072023/smil:starmaa1.smil/chunklist_b2628000.m3u8';

  ngAfterViewInit(): void {
    const video = this.videoRef.nativeElement;

    if (Hls.isSupported()) {
      this.hls = new Hls();

      this.hls.loadSource(this.streamUrl);
      this.hls.attachMedia(video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.message.set('');

        // Autoplay may be blocked by the browser.
        video.play().catch(() => {
          this.message.set('Press Play to start streaming.');
        });
      });

      this.hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          this.message.set('Unable to play stream. Check the URL or stream availability.');
          console.error('HLS playback error:', data);
          this.hls?.destroy();
          this.hls = undefined;
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support, such as Safari.
      video.src = this.streamUrl;

      video.addEventListener(
        'loadedmetadata',
        () => {
          this.message.set('');
          video.play().catch(() => {
            this.message.set('Press Play to start streaming.');
          });
        },
        { once: true },
      );

      video.addEventListener(
        'error',
        () => {
          this.message.set('Unable to load the HLS stream.');
        },
        { once: true },
      );
    } else {
      this.message.set('HLS playback is not supported in this browser.');
    }
  }

  async toggleFullscreen(): Promise<void> {
    const video = this.videoRef.nativeElement;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await video.requestFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }

  ngOnDestroy(): void {
    this.hls?.destroy();
  }
}
