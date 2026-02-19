export function formatFirstName(firstName: string) {
  return `${firstName.charAt(0).toUpperCase()}${firstName.slice(1)}`;
}

export function formatLastName(lastName: string) {
  return lastName.toUpperCase();
}

export function formatName(firstName: string, lastName: string) {
  return `${formatFirstName(firstName)} ${formatLastName(lastName)}`;
}

export function getTomorrow() {
  const today = new Date();
  return new Date(today.setDate(today.getDate() + 1));
}

export function formatYyyyDdMmDate(date: Date) {
  return `${new Date(date).getFullYear()}-${(new Date(date).getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${new Date(date).getDate().toString().padStart(2, '0')}`;
}

export function formatMmYyyyDate(data: Date) {
  return `${(new Date(data).getMonth() + 1)
    .toString()
    .padStart(2, '0')} / ${new Date(data).getFullYear()}`;
}

export function formatHHMM(date: Date) {
  const hours = new Date(date).getHours().toString().padStart(2, '0');
  const minutes = new Date(date).getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDateDefault(date: Date) {
  return `${new Date(date).getDate().toString().padStart(2, '0')}/${(
    new Date(date).getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}/${new Date(date).getFullYear()}`;
}

export function formatDateTime(dateTime: Date) {
  return `${new Date(dateTime).getUTCDate().toString().padStart(2, '0')}-${(
    new Date(dateTime).getUTCMonth() + 1
  )
    .toString()
    .padStart(2, '0')
    .toString()
    .padStart(2, '0')}-${new Date(dateTime)
    .getUTCFullYear()
    .toString()
    .padStart(2, '0')}  ${new Date(dateTime)
    .getHours()
    .toString()
    .padStart(2, '0')}:${new Date(dateTime)
    .getUTCMinutes()
    .toString()
    .padStart(2, '0')}`;
}

export function formatDoubleDigit(digit: number) {
  return digit.toString().padStart(2, '0');
}

export function formatMessageDate(d: Date) {
  if (!d) return null;
  const date = new Date(d);
  const today = new Date();
  const isToday = date.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);

  if (isToday) {
    return `Aujourd'hui, ${new Date(d).toLocaleString([], {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  return new Date(d).toLocaleString([], {
    hour12: false,
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isPhoneCorrect(telephone: string | undefined) {
  if (telephone && telephone?.trim()) {
    if (
      telephone
        ?.trim()
        ?.match(
          /^(?:(?:\+|00)33[\s.-]{0,3}(?:\(0\)[\s.-]{0,3})?|0)[1-9](?:(?:[\s.-]?\d{2}){4}|\d{2}(?:[\s.-]?\d{3}){2})$/
        ) === null &&
      telephone
        ?.trim()
        ?.match(
          /^(?:(?:\+|00|0)((262|692)|(263|693)|508|(5|6)90|(5|6)94|(5|6|7)96|681|687|689))(?:[\s.-]*\d{2}){3,4}$/
        ) === null
    ) {
      return false;
    }
  }
  return true;
}

export function capitalizeFirstLetter(string: string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}
