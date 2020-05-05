import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  TouchableNativeFeedback,
} from 'react-native';
import ProgressCircle from 'react-native-progress-circle';

import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {ScrollView} from 'react-native-gesture-handler';

import {Icon} from 'react-native-elements';
import formatDuration from 'format-duration';
import {genProgressForLesson} from '../../persistence';
import DownloadManager, {useDownloadStatus} from '../../download-manager';
import CourseData from '../../course-data';

// TODO: not DRY :/. but it also looks different in different contexts
// (though, to be fair, that should probably be remedied, since it's
// a crap affordance)
const renderDownloadProgress = (downloaded, progress) => {
  if (downloaded) {
    return <Icon name="download" type="font-awesome-5" size={24} />;
  }

  const downloading = progress && !progress.error && !progress.finished;
  const errored = progress && progress.error;

  if (errored) {
    return <Icon name="exclamation" type="font-awesome-5" size={24} />;
  }

  if (downloading) {
    const percent =
      progress.totalBytes === null
        ? 0
        : (progress.bytesWritten / progress.totalBytes) * 100;

    return (
      <ProgressCircle
        percent={percent}
        radius={14}
        borderWidth={3}
        color="#333"
        shadowColor="#ddd"
        bgColor="white">
        <Text style={styles.progressCircleText}>{Math.floor(percent)}</Text>
      </ProgressCircle>
    );
  }

  return null;
};

const LessonRow = (props) => {
  const downloadState = useDownloadStatus(props.course, props.lesson);

  const [progress, setProgress] = useState(null);
  const [downloaded, setDownloaded] = useState(null);

  useEffect(() => {
    (async () => {
      const [progress, downloaded] = await Promise.all([
        genProgressForLesson(props.course, props.lesson),
        DownloadManager.genIsDownloaded(props.course, props.lesson),
      ]);

      setProgress(progress);
      setDownloaded(downloaded);
    })();
  }, [props.lastUpdateTime, downloadState]);

  if (progress === null || downloaded === null) {
    return null; // TODO: show a greyed-out version without the features
  }

  const finished = progress && progress.finished;
  const downloading =
    downloadState && !downloadState.error && !downloadState.finished;

  return (
    <TouchableNativeFeedback
      onPress={() => {
        if (downloaded) {
          props.navigation.navigate('Listen', {
            course: props.course,
            lesson: props.lesson,
          });
        } else if (!downloading) {
          DownloadManager.startDownload(props.course, props.lesson);
        }
      }}>
      <View style={styles.row}>
        <View style={styles.text}>
          <Icon
            style={{...styles.finishedIcon, ...(finished ? {} : {opacity: 0})}}
            name="check"
            type="font-awesome-5"
            accessibilityLabel={finished ? 'finished' : 'not finished'}
            size={24}
          />
          <Text style={styles.lessonTitleText}>
            {CourseData.getLessonTitle(props.course, props.lesson)}
          </Text>
          <Text style={styles.lessonDurationText}>
            {formatDuration(
              CourseData.getLessonDuration(props.course, props.lesson) * 1000,
            )}
          </Text>
        </View>
        <View style={styles.icons}>
          {renderDownloadProgress(downloaded, downloadState)}
        </View>
      </View>
    </TouchableNativeFeedback>
  );
};

const styles = StyleSheet.create({
  row: {
    padding: 28,
    backgroundColor: 'white',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonTitleText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginRight: 24,
  },
  lessonDurationText: {
    fontSize: 16,
  },

  icons: {
    flexDirection: 'row',
  },
  finishedIcon: {
    marginRight: 24,
  },
  progressCircleText: {
    fontSize: 12,
  },
});

export default LessonRow;