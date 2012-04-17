import simplejson
import serial
import time
import urllib2
import config

arduino = serial.Serial(config.serial, 9600)
previous_count = ''
previous_id = '1'

tumblr = {}
old_tumblr = {}

def match_dict(new_list, old_list):
	old = dict((v['id'], v) for v in old_list)
	return [dict(d, **old[d['id']]) for d in new_list if d['id'] in old]

url = config.tumblr_key
json_string = urllib2.urlopen(url).read()
tumblr = simplejson.loads(json_string)
old_tumblr.update(tumblr) #duplicate the dictionary

while True:
	
	arduino.write('N')
	
	url = config.tumblr_key
	json_string = urllib2.urlopen(url).read()
	tumblr = simplejson.loads(json_string)
	
	for new in tumblr['response']['posts']:
		id_new = new['id']
		print "*** NEW ***"
		print new['note_count']
		print id_new
		print "\n"
		
		for old in old_tumblr['response']['posts']:
			id_old = old['id']
			print old['note_count']
			print id_old
			print "\n"
			if id_new == id_old:
				if new['note_count'] != old['note_count']:
					arduino.write('Y')
		print "---\n"
		
	time.sleep(30)
	old_tumblr.update(tumblr) # update the old dictionary