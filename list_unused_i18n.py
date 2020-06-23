#!/usr/bin/env python3

# Checks that labels put in label_fr.json are all used somehwere, in order to delete useless ones.
# USAGE: ./list_unused_i18n.py

import io, json, sys
from os import path, walk


STATICS_SRC_DIR = path.join(path.dirname(path.realpath(__file__)), 'src', 'app')
TARGET_FILES_EXTENSIONS = ('.html', '.js')
I18N_JSON_PATH = path.join(STATICS_SRC_DIR, 'i18n', 'label_fr.json')
# Labels to ignore. Sometimes useful, with generated labels for example.
# If I do "'someCssClass.' + filterFamily" in my source code, this script will not see it.
I18N_STRINGS_TO_IGNORE = ()


def main():
    files_to_inspect = list(scandir(STATICS_SRC_DIR, TARGET_FILES_EXTENSIONS))
    with open(I18N_JSON_PATH, 'r') as i18n_file:
        i18n = json.load(i18n_file)
    i18n_strings = set(i18n.keys()) - set(I18N_STRINGS_TO_IGNORE)
    unused_i18n_strings = [i18n_string for i18n_string in i18n_strings if not find_usage(i18n_string, files_to_inspect)]
    for unused_i18n_string in unused_i18n_strings:
        print('No usage found for', unused_i18n_string)
    if unused_i18n_strings:
        sys.exit(1)

def scandir(dirname, extensions):
    for dirpath, _, fnames in walk(dirname):
        for file_name in [path.join(dirpath, f) for f in fnames if any(f.endswith(ext) for ext in extensions)]:
            yield file_name

def find_usage(string, files_to_inspect):
    for file_name in files_to_inspect:
        with io.open(file_name, 'r', encoding='utf-8') as open_file:
            try:
                for line in open_file.readlines():
                    if string in line:
                        return True
            except:
                print('While processing', file_name)
                raise
    return False


if __name__ == '__main__':
    main()
