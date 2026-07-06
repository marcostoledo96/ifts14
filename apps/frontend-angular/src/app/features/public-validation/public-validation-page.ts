import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
} from '@angular/core';
import { ValidationService } from '../../shared/certificates/validation.service';
import { studentDocumentDisplay, ValidationViewState } from '../../shared/certificates/dto';

// ponytail: resource() está en @angular/core desde v20, sin HttpClient.
// params lee tokenCertificacion(); loader llama al servicio async.
// idle/loading/resolved/error quedan cubiertos por el estado del resource.
@Component({
  selector: 'app-public-validation-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './public-validation-page.html',
  styleUrl: './public-validation-page.css',
})
export class PublicValidationPage {
  readonly tokenCertificacion = input.required<string>();
  private readonly validation = inject(ValidationService);

  readonly verification = resource<ValidationViewState, { token: string }>({
    params: () => ({ token: this.tokenCertificacion() }),
    loader: async ({ params, abortSignal }) =>
      this.validation.verify(params.token, abortSignal),
  });

  readonly view = computed<ValidationViewState | null>(() => {
    if (this.verification.hasValue()) {
      return this.verification.value();
    }
    return null;
  });
  readonly isLoading = computed(() => this.verification.isLoading());
  readonly hasError = computed(() => this.verification.error() !== undefined);

  readonly documentDisplay = studentDocumentDisplay;

  readonly formatAttendedDates = (dates: string[] | undefined): string =>
    (dates ?? []).join(', ');
}