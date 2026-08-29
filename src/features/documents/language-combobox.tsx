"use client";

import {
  Button,
  ComboBox,
  FieldError,
  Group,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  type Key,
} from "react-aria-components";

import type { SupportedLanguage } from "@/features/translation/contract";
import type { AppErrorPayload } from "@/lib/errors/catalog";

type LanguageComboBoxProps = Readonly<{
  emptyMessage: string;
  error?: AppErrorPayload;
  label: string;
  languages: readonly SupportedLanguage[];
  name: "sourceLanguage" | "targetLanguage";
  onChange: (value: string) => void;
  openLabel: string;
  placeholder: string;
  value: string;
}>;

function LanguageOption({
  language,
}: Readonly<{ language: SupportedLanguage }>) {
  return (
    <>
      <span>{language.name}</span>{" "}
      <bdi dir="ltr" className="text-xs font-semibold text-subtle">
        ({language.code.toUpperCase()})
      </bdi>
    </>
  );
}

export function LanguageComboBox({
  emptyMessage,
  error,
  label,
  languages,
  name,
  onChange,
  openLabel,
  placeholder,
  value,
}: LanguageComboBoxProps) {
  function handleChange(key: Key | null) {
    if (typeof key === "string") onChange(key);
  }

  return (
    <ComboBox<SupportedLanguage>
      name={name}
      value={value}
      onChange={handleChange}
      items={languages}
      isRequired
      isInvalid={Boolean(error)}
      allowsEmptyCollection
      formValue="key"
      className="group flex flex-col"
    >
      <Label className="text-sm font-semibold text-muted">{label}</Label>
      <Group className="mt-2 flex h-12 overflow-hidden rounded-xl border border-border-strong bg-surface text-[15px] text-text transition group-data-focus-within:border-primary group-data-focus-within:ring-3 group-data-focus-within:ring-primary/10 group-data-invalid:border-danger">
        <Input
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent px-4 outline-none placeholder:text-subtle"
        />
        <Button
          aria-label={openLabel}
          className="flex w-11 shrink-0 cursor-pointer items-center justify-center border-s border-border text-muted outline-none transition hover:bg-surface-muted hover:text-text data-focus-visible:outline-2 data-focus-visible:-outline-offset-2 data-focus-visible:outline-primary"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4">
            <path
              d="m5.5 7.5 4.5 4.5 4.5-4.5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
            />
          </svg>
        </Button>
      </Group>
      {error ? (
        <FieldError className="mt-1.5 text-sm text-danger">
          {error.message}
        </FieldError>
      ) : null}
      <Popover
        placement="bottom start"
        offset={6}
        className="z-50 max-h-72 w-(--trigger-width) max-w-[calc(100vw-2rem)] overflow-auto rounded-2xl border border-border bg-surface p-2 text-text shadow-xl"
      >
        <ListBox<SupportedLanguage>
          renderEmptyState={() => (
            <div className="px-3 py-4 text-sm text-muted">{emptyMessage}</div>
          )}
          className="outline-none"
        >
          {(language) => (
            <ListBoxItem
              id={language.code}
              textValue={`${language.name} (${language.code.toUpperCase()})`}
              className="min-h-10 cursor-pointer rounded-xl px-3 py-2 text-sm text-muted outline-none transition hover:bg-surface-muted hover:text-text data-focus-visible:bg-surface-muted data-focus-visible:text-text data-focus-visible:outline-2 data-focus-visible:outline-primary data-selected:bg-selected data-selected:text-selected-text"
            >
              <LanguageOption language={language} />
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </ComboBox>
  );
}
