#!/usr/bin/env python3
'''
Checks that labels defined in label*.json files are all used somewhere, in order to delete useless ones.
'''

import argparse, io, json, sys
from glob import glob
from os.path import dirname, join, realpath
from subprocess import check_output


STATICS_SRC_DIR = join(dirname(realpath(__file__)), 'src', 'app')
TARGET_FILES_EXTENSIONS = ('.html', '.js')
I18N_JSON_FILEPATHS_PATTERN = join(STATICS_SRC_DIR, 'i18n', 'label*.json')
# Labels to ignore. Sometimes useful, with generated labels for example,
# as if I write "'someCssClass.' + filterFamily" in some JS file, this script will ignore it.
I18N_STRINGS_TO_IGNORE = ()


def main():
    args = parse_args()
    files_to_inspect = check_output(['git', 'ls-files', STATICS_SRC_DIR]).decode().split()
    files_to_inspect= [f for f in files_to_inspect if any(f.endswith(ext) for ext in TARGET_FILES_EXTENSIONS)]
    i18n_strings = set()
    for i18n_json_path in glob(I18N_JSON_FILEPATHS_PATTERN):
        with open(i18n_json_path) as i18n_file:
            i18n_strings.update(json.load(i18n_file).keys())
    i18n_strings -= set(I18N_STRINGS_TO_IGNORE)
    unused_i18n_strings = set(string for string in i18n_strings
                              if not find_usage(string, files_to_inspect, args.verbose))
    for unused_i18n_string in sorted(unused_i18n_strings):
        print('No usage found for', unused_i18n_string)
    if unused_i18n_strings:
        if not args.remove_from_jsons:
            sys.exit(1)
        for i18n_json_path in glob(I18N_JSON_FILEPATHS_PATTERN):
            with open(i18n_json_path) as i18n_file:
                i18n = json.load(i18n_file)
            for i18n_key in unused_i18n_strings:
                if i18n_key in i18n:
                    del i18n[i18n_key]
            with open(i18n_json_path, 'w') as i18n_file:
                json.dump(i18n, i18n_file, sort_keys=True, indent=2)

def parse_args():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--remove-from-jsons', action='store_true')
    parser.add_argument('--verbose', action='store_true')
    parser.add_argument('files', nargs='*')  # ignored but needed in order to be used as a pre-commit hook
    return parser.parse_args()

def find_usage(string, files_to_inspect, verbose):
    for file_name in files_to_inspect:
        with io.open(file_name, 'r', encoding='utf-8') as open_file:
            try:
                for line in open_file.readlines():
                    if string in line:
                        if verbose:
                            print('String "{}" found in {}'.format(string, filename))
                        return True
            except:
                print('While processing', file_name)
                raise
    return False


if __name__ == '__main__':
    main()
