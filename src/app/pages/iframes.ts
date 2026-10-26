import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-iframes',
  standalone: true,
  template: `
    <main class="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div class="mx-auto max-w-6xl">
        <header class="mb-6 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">Video Player</h1>
            <p class="mt-1 text-sm text-gray-500">Embedded video playback</p>
          </div>

          <button
            type="button"
            class="rounded-lg border border-gray-200 bg-white px-4 py-2
                   text-sm font-medium text-gray-700 hover:bg-gray-100"
            (click)="goBack()"
          >
            Back
          </button>
        </header>

        @if (src()) {
          <div
            class="overflow-hidden rounded-2xl border border-gray-200
                      bg-white shadow-sm"
          >
            <iframe
              class="aspect-video w-full"
              [src]="safeSrc()"
              title="Video player"
              allow="autoplay; fullscreen; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        } @else {
          <div class="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <h2 class="text-xl font-semibold text-gray-800">No video URL</h2>
            <p class="mt-2 text-gray-500">No src query parameter was received.</p>
          </div>
        }
      </div>
    </main>
  `,
})
export class IframesComponent {
  readonly src = signal('');

  readonly safeSrc = computed<SafeResourceUrl | null>(() => {
    const url = this.src();

    if (!url) {
      return null;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) {
    this.route.queryParamMap.subscribe((params) => {
      const url = params.get('src') ?? '';

      // Allow only the expected HTTPS embed origin.
      try {
        const parsed = new URL(url);

        this.src.set(
          parsed.protocol === 'https:' &&
            parsed.hostname === 'camstreams.tv' &&
            parsed.pathname.startsWith('/embed/')
            ? parsed.href
            : '',
        );
      } catch {
        this.src.set('');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/vid']);
  }
}
