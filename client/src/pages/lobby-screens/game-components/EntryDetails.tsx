import { getEntryMeaning } from '../../../shared/mode-utils';
import { GameEntry, Language } from '../../../shared/types';
import { JapText } from './JapText';

interface Props {
  entry: GameEntry;
  lang: Language;
}

/** Shows a detailed answer, for studying. */
export function EntryDetails({ entry, lang }: Props) {
  return (
    <>
      {entry.isKana ? (
        <JapText className="kana" text={entry.readings_romaji.join(', ')} />
      ) : (
        <>
          <aside className="readings">
            {/* <header>Reading</header> */}
            <JapText splitJapWords text={entry.readings_hiragana.join(', ')} />
          </aside>
          <aside className="meanings">
            {/* <header>Meaning</header> */}
            <JapText text={getEntryMeaning(entry, lang).join(', ')} />
          </aside>
        </>
      )}
    </>
  );
}
