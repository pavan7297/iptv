import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

interface Vid {
  id: number;
  title: string;
  categorie: string;
  ifv: string;
  link: string;
  url: boolean;
  frame: boolean;
}

@Component({
  selector: 'app-bits',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, MatButtonModule, TitleCasePipe],
  template: `
    <section class="min-h-screen bg-gray-50 px-4 py-10 text-gray-800 sm:px-8">
      <div class="mx-auto max-w-7xl">
        <!-- Header -->
        <header class="mb-8">
          <h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Video Library</h1>
          <p class="mt-2 text-gray-500">Browse videos and select a category to filter.</p>
        </header>

        <!-- Category Filter -->
        <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <mat-form-field appearance="outline" class="w-full sm:max-w-xs">
            <mat-label>Filter by category</mat-label>

            <mat-select
              [value]="selectedCategory()"
              (selectionChange)="selectedCategory.set($event.value)"
            >
              <mat-option value="all">All Categories</mat-option>

              @for (category of categories(); track category) {
                <mat-option [value]="category">
                  {{ category | titlecase }}
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <p class="text-sm text-gray-500">
            Showing
            <span class="font-semibold text-gray-800">
              {{ filteredVideos().length }}
            </span>
            videos
          </p>
        </div>

        <!-- Video Cards -->
        @if (filteredVideos().length > 0) {
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            @for (video of filteredVideos(); track video.id) {
              <article
                class="flex flex-col overflow-hidden rounded-2xl border border-gray-200
                       bg-white shadow-sm transition duration-200
                       hover:-translate-y-1 hover:shadow-lg"
              >
                <!-- Card Banner -->
                <div class="flex h-36 items-center justify-center bg-blue-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    class="h-14 w-14 text-blue-500"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="3" />
                    <path d="m10 9 5 3-5 3V9Z" fill="currentColor" />
                  </svg>
                </div>

                <!-- Card Content -->
                <div class="flex flex-1 flex-col p-5">
                  <div class="mb-3">
                    <span
                      class="inline-flex rounded-full bg-blue-50 px-3 py-1
                             text-xs font-semibold text-blue-700"
                    >
                      {{ video.categorie | titlecase }}
                    </span>
                  </div>

                  <h2 class="text-lg font-semibold text-gray-900">
                    {{ video.title }}
                  </h2>

                  <p class="mt-2 text-sm text-gray-500">Video ID: {{ video.id }}</p>

                  <div class="mt-auto pt-5">
                    <button
                      mat-flat-button
                      type="button"
                      class="!w-full"
                      (click)="openVideo(video)"
                    >
                      Watch Video
                    </button>
                  </div>
                </div>
              </article>
            }
          </div>
        } @else {
          <div class="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
            <h2 class="text-xl font-semibold text-gray-800">No videos found</h2>
            <p class="mt-2 text-gray-500">Try selecting another category.</p>
          </div>
        }

        <!-- Status Message -->
        @if (message()) {
          <div
            class="mt-6 rounded-lg border border-amber-200 bg-amber-50
                   p-4 text-sm text-amber-800"
            role="status"
          >
            {{ message() }}
          </div>
        }
      </div>
    </section>
  `,
})
export class Bits {
  readonly videos: Vid[] = [
    {
      id: 1,
      title: 'Video 1',
      categorie: 'english',
      link: '',
      ifv: 'https://camstreams.tv/embed/807568',
      url: false,
      frame: true,
    },
    {
      id: 2,
      title: 'Video 2',
      categorie: 'english',
      link: '',
      ifv: 'https://yesporn.vip/embed/30847',
      url: false,
      frame: true,
    },
    {
      id: 3,
      title: 'Video 3',
      categorie: 'english',
      link: '',
      ifv: 'https://yesporn.vip/embed/48523',
      url: false,
      frame: true,
    },
    {
      id: 4,
      title: 'Video 4',
      categorie: 'hindi',
      link: '',
      ifv: 'https://yesporn.vip/embed/49883',
      url: false,
      frame: true,
    },
    {
      id: 5,
      title: 'Suno Sasurji - Kooku',
      categorie: 'hindi',
      link: 'https://xxx.se-video.com/watch/374645/',
      ifv: '',
      url: true,
      frame: false,
    },

    {
      id: 6,
      title: 'Nayi Naveli- Kooku',
      categorie: 'hindi',
      link: 'https://xxx.se-video.com/watch/371261/',
      ifv: '',
      url: true,
      frame: false,
    },

    {
      id: 7,
      title: 'Romantic Teen ',
      categorie: 'hindi',
      link: 'https://xxx.se-video.com/watch/398341/',
      ifv: '',
      url: true,
      frame: false,
    },
    {
      id: 8,
      title: 'rajani 1 ',
      categorie: 'hindi',
      link: 'https://noodlemagazine.com/watch/-192266460_456240901',
      ifv: '',
      url: true,
      frame: false,
    },
        {
      id: 9,
      title: 'rajani 2 ',
      categorie: 'hindi',
      link: 'https://noodlemagazine.com/watch/-222154335_456239405',
      ifv: '',
      url: true,
      frame: false,
    },
            {
      id: 10,
      title: 'shahad',
      categorie: 'hindi',
      link: 'https://botmaal.movie/shahad-episode-4/',
      ifv: '',
      url: true,
      frame: false,
    },
         {
      id: 10,
      title: 'in car',
      categorie: 'hindi',
      link: 'https://trahkino.cc/video/151661/',
      ifv: '',
      url: true,
      frame: false,
    },
             {
      id: 11,
      title: "Jaanu telugu cam",
      categorie: 'cam',
      link: '',
      ifv: 'https://camstreams.tv/embed/1330134',
      url: true,
      frame: false,
    },
 
                    {
      id: 11,
      title: "Jaanu telugu",
      categorie: 'cam',
      link: '',
      ifv: 'https://camstreams.tv/embed/1353612',
      url: true,
      frame: false,
    },
                        {
      id: 12,
      title: "parivartan",
      categorie: 'Hindi',
      link: 'https://bindasmood.com/parivartan-2023-primeplay-originals-hindi-xxx-web-series-ep7',
      ifv: '',
      url: true,
      frame: false,
    },
  ];

  selectedCategory = signal('all');
  message = signal('');

  categories = computed(() =>
    [...new Set(this.videos.map((video) => video.categorie))].sort((a, b) => a.localeCompare(b)),
  );

  filteredVideos = computed(() =>
    this.videos
      .filter(
        (video) => this.selectedCategory() === 'all' || video.categorie === this.selectedCategory(),
      )
      .sort((a, b) => a.title.localeCompare(b.title)),
  );

  constructor(private router: Router) {}

  openVideo(video: Vid): void {
    this.message.set('');

    if (video.ifv.trim()) {
      this.router.navigate(['/iframes'], {
        queryParams: { src: video.ifv },
      });
      return;
    }

    if (video.link.trim()) {
      window.open(video.link, '_blank', 'noopener,noreferrer');
      return;
    }

    this.message.set(`No iframe URL or video link is available for "${video.title}".`);
  }
}
