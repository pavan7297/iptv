import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  signal,
} from '@angular/core';

import Hls from 'hls.js';

interface IptvChannel {
  name: string;
  url: string;
  logo: string;
}

@Component({
  selector: 'app-iptv',
  standalone: true,
  imports: [],
  template: `
    <main class="fixed inset-0 h-dvh w-screen overflow-hidden bg-black">
      <!-- Video Player -->
      <video
        #videoPlayer
        class="absolute inset-0 h-full w-full bg-black object-contain"
        controls
        playsinline
        preload="auto"
      ></video>

      <!-- Top Controls -->
      <div class="absolute left-3 right-3 top-3 z-20 sm:left-6 sm:right-6 sm:top-5">
        <div class="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row">
          <!-- Search Channels -->
          <input
            type="search"
            placeholder="Search Telugu channels..."
            class="min-w-0 flex-1 rounded-xl border border-gray-200
                   bg-white/95 px-4 py-3 text-sm text-gray-900
                   shadow-lg outline-none focus:ring-2 focus:ring-blue-500"
            [value]="searchText()"
            (input)="onSearch($event)"
          />

          <!-- Channel Dropdown -->
          <select
            class="w-full rounded-xl border border-gray-200
                   bg-white px-4 py-3 text-sm font-medium text-gray-900
                   shadow-lg outline-none focus:ring-2 focus:ring-blue-500
                   sm:max-w-sm"
            [value]="selectedIndex()"
            (change)="onChannelChange($event)"
            [disabled]="loading() || channels().length === 0"
            aria-label="Select a Telugu TV channel"
          >
            <option value="-1" disabled>Select a channel</option>

            @for (channel of filteredChannels(); track channel.url; let i = $index) {
              <option [value]="channel.index">
                {{ channel.name }}
              </option>
            }
          </select>
        </div>

        <div class="mx-auto mt-3 max-w-5xl">
          <div
            class="inline-flex flex-wrap items-center gap-2 rounded-lg
                      bg-black/70 px-3 py-2 text-xs text-white"
          >
            <span>{{ channels().length }} channels loaded</span>
            <span class="text-gray-400">•</span>
            <span>{{ filteredChannels().length }} matching</span>
            @if (selectedChannel(); as channel) {
              <span class="text-blue-300">• {{ channel.name }}</span>
            }
          </div>
        </div>
      </div>

      <!-- Loading / Error / Playback Status -->
      @if (message()) {
        <div
          class="absolute bottom-24 left-1/2 z-30 w-max max-w-[90%]
                 -translate-x-1/2 rounded-xl bg-white px-5 py-3
                 text-center text-sm text-gray-800 shadow-xl"
          role="status"
        >
          {{ message() }}
        </div>
      }

      <!-- Fullscreen -->
      <button
        type="button"
        (click)="toggleFullscreen()"
        class="absolute bottom-5 right-4 z-20 rounded-xl
               bg-white px-4 py-3 text-sm font-semibold text-gray-900
               shadow-lg transition hover:bg-gray-100 sm:bottom-6 sm:right-6"
      >
        ⛶ Full screen
      </button>
    </main>
  `,
})
export class Iptv implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer')
  videoRef!: ElementRef<HTMLVideoElement>;

  readonly playlistUrl = 'https://iptv-org.github.io/iptv/languages/tel.m3u';

  readonly channels = signal<IptvChannel[]>([]);
  readonly loading = signal(true);
  readonly message = signal('Loading Telugu channels...');
  readonly searchText = signal('');
  readonly selectedIndex = signal('-1');

  private hls?: Hls;
  private viewReady = false;
  private playbackRequest = 0;

  filteredChannels = () => {
    const search = this.searchText().trim().toLowerCase();

    return this.channels()
      .map((channel, index) => ({ ...channel, index }))
      .filter((channel) => channel.name.toLowerCase().includes(search));
  };

  selectedChannel = () => {
    const index = Number(this.selectedIndex());
    return Number.isInteger(index) && index >= 0 ? (this.channels()[index] ?? null) : null;
  };

  ngOnInit(): void {
    void this.loadPlaylist();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
  }

  private async loadPlaylist(): Promise<void> {
    try {
      this.loading.set(true);
      this.message.set('Loading Telugu channels...');

      const response = await fetch(this.playlistUrl, {
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`Playlist request failed: HTTP ${response.status}`);
      }

      const playlist = await response.text();
      const parsed = this.parseM3U(playlist);

      this.channels.set(parsed);
      this.message.set(
        parsed.length
          ? 'Choose a channel to start playback.'
          : 'No channels were found in the playlist.',
      );
    } catch (error) {
      console.error('Playlist loading error:', error);
      this.message.set('Unable to load channels. Check your internet connection and try again.');
    } finally {
      this.loading.set(false);
    }
  }

  private parseM3U(content: string): IptvChannel[] {
    const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/);
    const result: IptvChannel[] = [];

    let name = '';
    let logo = '';

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (!line) {
        continue;
      }

      if (line.startsWith('#EXTINF:')) {
        const comma = line.indexOf(',');
        const metadata = comma >= 0 ? line.slice(0, comma) : line;
        const displayName = comma >= 0 ? line.slice(comma + 1).trim() : '';

        name = displayName || metadata.match(/tvg-name="([^"]+)"/)?.[1] || 'Unknown channel';

        logo = metadata.match(/tvg-logo="([^"]+)"/)?.[1] ?? '';
        continue;
      }

      if (line.startsWith('#')) {
        continue;
      }

      if (/^https?:\/\//i.test(line)) {
        result.push({
          name: name || `Channel ${result.length + 1}`,
          url: line,
          logo,
        });
      }

      name = '';
      logo = '';
    }

    return result;
  }

  onSearch(event: Event): void {
    this.searchText.set((event.target as HTMLInputElement).value);
  }

  onChannelChange(event: Event): void {
    const index = (event.target as HTMLSelectElement).value;
    const parsedIndex = Number(index);
    const channel = Number.isInteger(parsedIndex) ? this.channels()[parsedIndex] : undefined;

    if (!channel) {
      return;
    }

    this.selectedIndex.set(index);

    if (this.viewReady) {
      void this.playChannel(channel);
    }
  }

  private async playChannel(channel: IptvChannel): Promise<void> {
    const requestId = ++this.playbackRequest;
    const video = this.videoRef.nativeElement;

    this.hls?.destroy();
    this.hls = undefined;

    video.pause();
    video.removeAttribute('src');
    video.load();

    this.message.set(`Connecting to ${channel.name}...`);

    if (Hls.isSupported()) {
      const hls = new Hls();
      this.hls = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (requestId !== this.playbackRequest) {
          return;
        }

        this.message.set('');
        void video.play().catch(() => {
          if (requestId === this.playbackRequest) {
            this.message.set('Press Play to start the channel.');
          }
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal || requestId !== this.playbackRequest) {
          return;
        }

        console.error('HLS playback error:', data);
        this.message.set(
          `Unable to play ${channel.name}. The stream may be offline or unavailable.`,
        );

        hls.destroy();

        if (this.hls === hls) {
          this.hls = undefined;
        }
      });

      hls.loadSource(channel.url);
      hls.attachMedia(video);
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = channel.url;

      video.onloadedmetadata = () => {
        if (requestId !== this.playbackRequest) {
          return;
        }

        this.message.set('');

        void video.play().catch(() => {
          if (requestId === this.playbackRequest) {
            this.message.set('Press Play to start the channel.');
          }
        });
      };

      video.onerror = () => {
        if (requestId === this.playbackRequest) {
          this.message.set('Unable to load this stream.');
        }
      };

      video.load();
      return;
    }

    this.message.set('HLS playback is not supported in this browser.');
  }

  async toggleFullscreen(): Promise<void> {
    const video = this.videoRef.nativeElement;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        const container = video.parentElement;

        if (container?.requestFullscreen) {
          await container.requestFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      this.message.set('Unable to enter full-screen mode.');
    }
  }

  ngOnDestroy(): void {
    this.playbackRequest++;
    this.hls?.destroy();
  }
}
